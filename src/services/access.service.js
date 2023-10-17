'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair, verifyJWT } = require("../auth/authUtils")
const { getInfoData, convertToObjectIdMongodb } = require("../utils")
const { BadRequestError, ForbiddenError, ConflictRequestError, AuthFailureError, NotFoundError } = require("../core/error.response")
const { findByEmail } = require("./shop.service")


const RoleShop = {
    SHOP: '01',
    WRITER: '02',
    EDITOR: '03',
    ADMIN: '00'
}

class AccessService {

    /* 
       check this token used?
    */
   static handlerRefresh = async (refreshToken) => {
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
    if(foundToken) {
        const {userId, email} = await verifyJWT(refreshToken, foundToken.privateKey)
        // delete
        await KeyTokenService.deleteKeyById(userId)
        throw new ForbiddenError(`Something wrong happend !! Pls relogin`)
    }
     const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
     if(!holderToken) throw new AuthFailureError('Shop not registed')

     //verify token
     const {userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)
     const foundShop = await findByEmail({email})
     if(!foundShop) throw new AuthFailureError('Shop not registed')
     
     //create 1 cap moi
      const tokens = await createTokenPair({userId,email}, holderToken.publicKey, holderToken.privateKey)
     
     //upate token
       await KeyTokenService.updateKeyToken(
        { _id: holderToken._id }, // Điều kiện tìm kiếm
        {
          $set: {
            refreshToken: tokens.refreshToken,
          },
          $addToSet: {
            refreshTokensUsed: refreshToken
          }
        }
      );
     return {
        user: {userId,email},
        tokens
     }
   }
    
   // V2
   static handlerRefreshV2 = async ({keyStore, user, refreshToken}) => {
    const {userId,email} = user
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
        await KeyTokenService.deleteKeyById(userId)
        throw new ForbiddenError(`Something wrong happend !! Pls relogin`)
    }
     
    if(keyStore.refreshToken !== refreshToken) throw new ForbiddenError(`Shop not registeted`)
    const foundShop = await findByEmail({email})
    if(!foundShop) throw new AuthFailureError('Shop not registed')
    
    //create 1 cap moi
     const tokens = await createTokenPair({userId,email}, keyStore.publicKey, keyStore.privateKey)
    
    //upate token
    await KeyTokenService.updateKeyToken(
        { _id: keyStore._id }, // Điều kiện tìm kiếm
        {
          $set: {
            refreshToken: tokens.refreshToken,
          },
          $addToSet: {
            refreshTokensUsed: refreshToken
          }
        }
      );
     return {
        user,
        tokens
     }
   }

    


    static signUp = async ({ name, email, password }) => {

        //step1: check email exists??
        const holderShop = await shopModel.findOne({ email }).lean()
        if (holderShop) {
            throw new BadRequestError('Error: Shop already register!')
        }
        const passwordHash = await bcrypt.hash(password, 10)

        const newShop = await shopModel.create({
            name, email, password: passwordHash, roles: [RoleShop.SHOP]
        })

        if (newShop) {
            const privateKey = crypto.randomBytes(64).toString('hex')
            const publicKey = crypto.randomBytes(64).toString('hex')

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })
            if (!keyStore) {
                return {
                    code: 'xxx',
                    message: 'keyStore error'
                }
            }


            //createTokenPair
            const tokens = await createTokenPair(
                {
                    userId: newShop._id,
                    email,
                },
                publicKey,
                privateKey
            )


            return {

                shop: getInfoData(
                    {
                        fileds: ['_id', 'name', 'email','status', 'verify','roles'],
                        objects: newShop
                    }
                ),
                tokens

            }

        }
        return {
            code: 200,
            metadata: null
        }

    }

    /*
        1- check email in dbs
        2- match pwd
        3- create AT vs RT and save
        4- genarate tokens
        5- get data return login 
    */
    static login = async ({ email, password, refreshToken = null }) => {
    
        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new BadRequestError('Shop Not Registed')
        const match = await bcrypt.compare(password, foundShop.password)
        if (!match) throw new AuthFailureError('Authentication Error')

        //3.
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')
        
        const {_id: userId} = foundShop
        const tokens = await createTokenPair({
            userId, email
        }, publicKey, privateKey)

        await KeyTokenService.createKeyToken({
            userId, 
            refreshToken: tokens.refreshToken,
            privateKey, publicKey
        })

        return {

            shop: getInfoData(
                {
                    fileds: ['_id', 'name', 'email','status', 'verify','roles'],
                    objects: foundShop
                }
            ),
            tokens

        }
    }

    static logout = async(keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore.key._id)
        console.log({delKey})
        return delKey
    }

    static getInfoShop = async(id) => {
        const shop = await shopModel.findById(convertToObjectIdMongodb(id))
        if(!shop) throw new NotFoundError(`Shop Not Found`)
        return shop
    }
}

module.exports = AccessService