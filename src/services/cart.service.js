'use strict'
const {cart} = require('../models/cart.model')
const {BadRequestError, NotFoundError} = require('../core/error.response')
const { use } = require('bcrypt/promises')
const { getProductById } = require('../models/repositories/product.repo')
const { convertToObjectIdMongodb } = require('../utils')
const { checkUserExists } = require('../helpers/check.call.service')
/*
 Key features: Cart Service
 - add product to cart
 - reduce product quantity by one
 - increase product quantity
 - get cart
 - delete cart
 - delete cart item
*/

class CartService {
    
    //Start Repo Cart
    static async createUserCart({userId, product}) {
        const query = {cart_userId: userId, cart_state: 'active'},
        updateOrInsert = {
            $addToSet: {
                cart_products: product
            }
        }, options = {upsert:true, new:true}
        return await cart.findOneAndUpdate(query, updateOrInsert, options)
    }

    static async updateUserCartQuantity({userId, product}) {
        console.log("vao day");
    const {productId, quantity} = product;
    const query = {
        cart_userId: userId,
        'cart_products.productId': productId,
        cart_state: 'active'
    };
    const updateSet = {
        $inc: {
            'cart_products.$.quantity': quantity
        }
    };
    const options = {
        upsert: true,
        new: true
    };
    return await cart.findOneAndUpdate(query, updateSet, options);
}


    

   static async addToCart({userId, product={}}) {
    // const userExist =  checkUserExists({userId})
    // if(!userExist) throw new NotFoundError('Not Found User')

    const userCart = await cart.findOne({cart_userId: userId})
 

    const foundProduct = await getProductById(product.productId)
    if(!foundProduct) throw new NotFoundError('Not Found Product')

       product = {
              productId: (foundProduct._id).toString(),
              shopId: (foundProduct.product_shop).toString(),
              quantity: product.quantity,
              price: foundProduct.product_price,
              name: foundProduct.product_name,
              thumb: foundProduct.product_thumb,
              variation: product.variation

          }
    if(!userCart) {
        console.log("taoj ne");
         // create cart for User
         return await CartService.createUserCart({userId, product})
    }

        
        

    // if have cart but haven't product
    if(!userCart.cart_products.length) {
        userCart.cart_products = [product]
        return await userCart.save()
    }

    // Check if product exists in cart
    const existingProductIndex = userCart.cart_products.findIndex(p => p.productId === product.productId);
    if(existingProductIndex !== -1) {
        // Product already exists, increase quantity
        return await CartService.updateUserCartQuantity({userId, product})
    } else {
        // Product doesn't exist, add it to cart
        userCart.cart_products.push(product);
    }

     return await userCart.save();

      
   }

   //update
   /*
      shop_order_ids: [
        {
            shopId,
            item_products: [
                {
                    quantity,
                    oldQuantity,
                    price,
                    shopId
                }
            ]
        }
      ]
   */

       static async addToCartV2({userId, shop_order_ids}) {
         const {productId, quantity, old_quantity} = shop_order_ids[0]?.item_products[0]
         console.log("chec",{productId, quantity, old_quantity});
         //checkprodut
         const foundProduct = await getProductById(productId)
         if(!foundProduct) throw new NotFoundError(`Not Found Product`)

         //compare
         if(foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
            throw new NotFoundError(`Product do not belong to the shop`)
         }

         if(quantity === 0) {
            await CartService.deleteUserCart({userId, productId})
         }

         return await CartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity
            }
         })
       }

       static async deleteUserCart({userId, productId}) {
         console.log("user",userId, productId);
         const query = {cart_userId: userId, cart_state: 'active'},
         updateSet = {
            $pull: {
                cart_products: {
                    productId
                }
            }
         }
         const deleteCart = await cart.updateOne(query, updateSet)
         // Lấy thông tin cart sau khi xóa
    const updatedCart = await cart.findOne(query);

    return updatedCart;
       }

       static async getListUserCart({userId}) {
        return await cart.findOne({
            cart_userId: userId
        }).lean()
       }
}

module.exports = CartService