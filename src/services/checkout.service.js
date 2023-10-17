'use strict'

const { NotFoundError, BadRequestError } = require("../core/error.response")
const { order } = require("../models/order.model")
const { product } = require("../models/product.model")
const { findCartById, checkProductByServer } = require("../models/repositories/cart.repo")
const {getDiscountAmount} = require('../services/discount.service')
const { acquireLock, releaseLock } = require("./redis.service")
  

class CheckoutService {
    
    /**
     * {
     *    cartId,
     *    userId,
     *    shop_order_ids: [
     *          {
     *             shopId,
     *             shop_discount:[],
     *             item_products: [
     *                {
     *                  price,
     *                  quantity, 
     *                  codeId
     *                 } 
     *               ]
     *           }]
     * }
     */

    static async checkoutReview({
        cartId, userId, shop_order_ids=[]
    }) {
        
        //check cartId ton tai hay ko?
        const foundCart = await findCartById(cartId)
        if(!foundCart) throw new BadRequestError(`Cart does not exists!`)
    
        const checkout_order = {
            totalPrice: 0, // tong tien hang
            feeShip: 0,
            totalDiscount: 0, // tong tien giam gia
            totalCheckout: 0 
        }
        const shop_order_ids_new = []
    
        //tinh tong tien bill
        for (let i = 0; i < shop_order_ids.length; i++) {
           

            const {shopId, shop_discounts=[], item_products=[]} = shop_order_ids[i]
            
            //check product on server
            const checkProductServer = await checkProductByServer(item_products)
            
            if(!checkProductServer[0]) throw new BadRequestError('Order wrong!!')
    
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            },0)
    
            // tong tien truoc khi xu li
            checkout_order.totalPrice = checkoutPrice
    
            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice,
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer
            }
    
            //neu shop_discount ton tai > 0, check xem cos hop le ko
            if(shop_discounts.length > 0) {

                //gia su chi co 1 discount
                const {totalPrice=0, discount=0} = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })
                // tong cong discount giam gia
                checkout_order.totalDiscount += discount
    
                if(discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
            }
    
            // tong thanh toan cuoi cung
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
            shop_order_ids_new.push(itemCheckout)
            
        }
        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }


    //order

    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address= {},
        user_payment = {}
    }) {
        const {shop_order_ids_new, checkout_order} = await CheckoutService.checkoutReview({
            cartId, userId, shop_order_ids
        })

        //check lai 1 lan nua xem vuot ton kho ko
        const products = shop_order_ids_new.flatMap(order => order.item_products)
        console.log('[1]', products);
        const acquireProduct = []
        for (let i = 0; i < products.length; i++) {
            const {productId, quantity} = product[i]
            const keyLock = await acquireLock(productId, quantity, cartId)
            acquireProduct.push(keyLock ? true : false)
            if(keyLock) {
                await releaseLock(keyLock)
            }
        }

        //check if co 1 san pham het hang trong kho
        if(acquireProduct.includes(false)) {
            throw new BadRequestError(`Mot so san pham da duoc cap nhat, vui long quay lai gio hang`)

        }
        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        })

        // neu insert thanh cong remove product co trong gio hang
        if(newOrder) {
            
        }

        return newOrder
    }


    /**
     * 1. query orders [Users]
     */
    static async getOrdersByUser() {

    }

    /**
     * 2. query orders using id [Users]
     */
    static async getOneOrderByUser() {
        
    }

    /**
     * 3. Cancel orders [Users]
     */
    static async cancelOrderByUser() {
        
    }

    /**
     * 4. update order status [Shop | Admin]
     */
    static async updateOrderStatusByShop() {
        
    }
    
}

module.exports = CheckoutService