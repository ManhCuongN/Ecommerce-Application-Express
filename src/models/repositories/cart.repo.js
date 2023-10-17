'use strict'

const { convertToObjectIdMongodb } = require('../../utils')
const {cart} = require('../cart.model')
const { getProductById } = require('./product.repo')

const findCartById = async(cartId) => {
    return await cart.findOne({_id: convertToObjectIdMongodb(cartId), cart_state: 'active'}).lean()
}

const checkProductByServer = async(products) => {
    console.log("soluong", products.length);
     return await Promise.all(products.map(async product => {
        const foundProduct = await getProductById(product.productId)

        if(foundProduct) {
            return {
                price: foundProduct.product_price,
                quantity: product.quantity,
                productId: product.productId
            }
        } 
    }))
}

module.exports = {
    findCartById,
    checkProductByServer
}