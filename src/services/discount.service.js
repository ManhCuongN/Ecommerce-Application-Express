'use strict'
const { BadRequestError, NotFoundError } = require('../core/error.response')
const { discount } = require("../models/discount.model")
const { convertToObjectIdMongodb } = require('../utils')
const {findAllProducts} = require("../models/repositories/product.repo")
const {findAllDiscountCodesUnSelect, checkDiscountExists} = require('../models/repositories/discount.repo')
/*
 1 - Generator Discount Code (Shop | Admin)
 2 - Get discount amount (User)
 3 - get all discount code (User | Shop)
 4 - Verify discount code (User)
 5 - Delete discount code (Shop | Admin)
 6 - Cancel discount code (User)
*/

class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code, start_date, end_date, is_active,
            shopId, min_order_value, product_ids, applies_to,
            name, description, type, value, max_value, max_uses,
            uses_count, max_uses_per_user, user_used
        } = payload

        // check
        // if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
        //     throw new BadRequestError(`Discount code has expried`)
        // }

        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError("Start date must be before end date")
        }

        //create index for discount code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        }).lean()

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError(`Discount exists!`)
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_user_count: uses_count,
            discount_users_used: user_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids
        })

        return newDiscount
    }

    // get list product by discount code
    static async getAllDiscountCodesWithProduct({
        code, shopId, userId, limit, page
    })  {
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        }).lean()

        if(!foundDiscount || !foundDiscount.discount_is_active) {
             throw new NotFoundError('Discount not exists!')
        }
        
        console.log("foundDiscount", foundDiscount);
        const { discount_applies_to, discount_product_ids } = foundDiscount
        let products
        if(discount_applies_to === 'all') {
           products = await findAllProducts({
            filter: {
                product_shop: convertToObjectIdMongodb(shopId),
                isPulished: true
            }, 
            limit: +limit,
            page: +page,
            sort: 'ctime',
            select: ['product_name']
           })
        }

        if(discount_applies_to === 'specific') {
          products = await findAllProducts({
            filter: {
                _id: {$in: discount_product_ids},
                isPulished: true
            }, 
            limit: +limit,
            page: +page,
            sort: 'ctime',
            select: ['product_name']
          })
        }
        return products
    }

    // get all discount by shop
    static async getAllDiscountCodesByShop({
        limit, page, shopId
    }) {
        const discounts = await findAllDiscountCodesUnSelect({
           limit : +limit,
           page: +page,
           filter: {
            discount_shopId: shopId,
            discount_is_active: true
           },
           unSelect: ['__v', 'discount_shopId'],
           model: discount
        })
        return discounts
    }

    /*
     Apply Discount code
      products = [
        {
            productId,
            ShopId, 
            quantity,
            name, price
        }
      ]
    */

      static async getDiscountAmount({codeId, userId, shopId, products}) {
       
          const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
          })

          if(!foundDiscount) throw new NotFoundError(`Discount doesn't exists`)

          const {
            discount_is_active,
            discount_max_uses,
            discount_start_date,
            discount_end_date,
            discount_min_order_value,
            discount_users_used,
            discount_max_uses_per_user,
            discount_type,
            discount_max_value
          } = foundDiscount

          if(!discount_is_active) throw new NotFoundError('Discount expried')
          if(!discount_max_uses) throw new NotFoundError(`Discount are out`)

          if(new Date() < new Date(discount_start_date) || 
             new Date() > new Date (discount_end_date)
            ) {
                throw new NotFoundError ('Discount code has expried')
            }
            // check xem co gia tri toi thieu k
            let totalOrder = 0
            if(discount_min_order_value > 0) {
                //getTotal
                totalOrder = products.reduce((acc, product) => {
                    return acc + (product.quantity * product.price)
                },0)
                if(totalOrder < discount_min_order_value) {
                    throw new NotFoundError(`Discount requires a minium order value of ${discount_min_order_value}`)
                }
            }

            if(discount_max_uses_per_user > 0) {
                const userUserDiscount = discount_users_used.find(user => user.userId === userId)
                if(userUserDiscount) {
                    throw new BadRequestError(`You used voucher`)
                }
            }

            //check xem discount hay fixed_amount
            const amount = discount_type === 'fixed_amount' ?
            discount_max_value : totalOrder * (discount_max_value / 100)
            return {
                totalOrder,
                discount: amount,
                totalPrice: totalOrder - amount
            }
        }

        static async deleteDiscountCode({shopId, codeId}) {
         const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongodb(shopId)
         })
         return deleted
        }
       
        //user cancel
        static async cancelDiscountCode({codeId, shopId, userId}) {
            const foundDiscount = await checkDiscountExists({
                model: discount,
                filter: {
                    discount_code: codeId,
                    discount_shopId: convertToObjectIdMongodb(shopId)
                }
            })
            if(!foundDiscount) throw new NotFoundError(`Discount not exists`)

            const result = await discount.findByIdAndUpdate(foundDiscount._id,{
                $pull: {
                    discount_users_used: userId
                },
                $inc: {
                    discount_max_uses: 1,
                    discount_user_count: -1
                }
            })
            return result
        }
}

module.exports = DiscountService