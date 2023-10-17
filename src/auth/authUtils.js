'use strict'
const JWT = require('jsonwebtoken')

const {asyncHandler} = require('../helpers/asyncHandler')
const {HEADER} = require('../constants/index')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')

const authentication = asyncHandler(async(req, res,next) =>  {
   const userId = req.headers[HEADER.CLIENT_ID]
   if(!userId) throw new AuthFailureError('Invalid Request')

   const keyStore = await findByUserId(userId)

   if(!keyStore) throw new NotFoundError('Not Found KeyStore')
   
   const accessToken = req.headers[HEADER.AUTHORIZATION]
   if(!accessToken) throw new AuthFailureError('Invalid Request')

   try {
      const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
      if(userId !== decodeUser.userId) throw new AuthFailureError("Invalid UserId")
      req.keyStore = keyStore
     return next()
   } catch (error) {
      throw error
   }
})

const authenticationV2 = asyncHandler(async(req, res,next) =>  {
   console.log("accessToken", req.headers[HEADER.CLIENT_ID],req.headers[HEADER.AUTHORIZATION], req.headers[HEADER.REFRESHTOKEN] );
   
   const userId = req.headers[HEADER.CLIENT_ID]

   if(!userId) throw new AuthFailureError('Invalid Request')

   const keyStore = await findByUserId(userId)

   if(!keyStore) throw new NotFoundError('Not Found KeyStore')
   const accessToken = req.headers[HEADER.AUTHORIZATION]
  
   if(!accessToken) throw new AuthFailureError('Invalid Request')
   if(req.headers[HEADER.REFRESHTOKEN]) {
      try {
         const refreshToken = req.headers[HEADER.REFRESHTOKEN]
         const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
         if(userId !== decodeUser.userId) throw new AuthFailureError("Invalid UserId")
         req.keyStore = keyStore
         req.user = decodeUser
         req.refreshToken = refreshToken
        return next()
      } catch (error) {
         throw error
      }
   }



   try {
      const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
      if(userId !== decodeUser.userId) throw new AuthFailureError("Invalid UserId")
      req.keyStore = keyStore
     return next()
   } catch (error) {
      throw error
   }
})



const createTokenPair = async(payload, publicKey, privateKey) => {
   try {
     //accessToke
     const accessToken = await JWT.sign(payload, publicKey, {
        expiresIn: '2 days'
     })

     const refreshToken = await JWT.sign(payload, privateKey,{
        expiresIn: '7 days'
     })

     JWT.verify(accessToken, publicKey, (err, decode) => {
        if(err) {
            console.log(`error verify`, err);
        } else {
            console.log(`decode verify`, decode);
        }
     })


     return {accessToken, refreshToken}
   } catch (error) {
    
   }
}

const verifyJWT = async (token, keySecret) => {
   return await JWT.verify(token, keySecret)
}


module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
    authenticationV2
}