'use strict'

const { product, clothing, electronic, furniture, variationClothing } = require('../models/product.model')
const { BadRequestError } = require('../core/error.response')
const { findAllDraftsForShop,
        publishProductByShop,
        findAllPulishedForShop,
        unPublishProductByShop,
searchProductByUser,
findAllProductsByShop,
findAllProducts, findProduct, updateProductById
 } = require('../models/repositories/product.repo')
const { removeUndefinedObject, updateNestedObjectParse } = require('../utils')
const { insertInventory } = require('../models/repositories/inventory.repo')
const { pushNotiToSystem } = require('./notification.service')
const { TYPE_NOTIFICATIONS } = require('../constants')

// define factory class to create product

class ProductFactory {
    /* 
      type: 'Clothing',
    */

    static productRegistry = {} //key-class
    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) throw new BadRequestError(`Invalid Product Types ${type}`);
        return new productClass(payload).createProduct()

    }

    static async updateProduct(type, productId, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) throw new BadRequestError(`Invalid Product Types ${type}`);
        return new productClass(payload).updateProduct(productId)

    }

    //START PUT
    
    static async publishProductByShop({product_shop, product_id}) {
        return await publishProductByShop({product_shop, product_id})
    }

    static async unPublishProductByShop({product_shop, product_id}) {
        return await unPublishProductByShop({product_shop, product_id})
    }




    //END PUT


    //query
    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true }
        return await findAllDraftsForShop({ query, limit, skip })

    }

    static async findAllPulishedForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPulished: true }
        return await findAllPulishedForShop({ query, limit, skip })

    }

    static async searchProducts ({keySearch}) {
        return await searchProductByUser({keySearch})
    }

    static async findAllProducts ({limit = 50, sort='ctime', page=1, filter={isPulished: true}}) {
       return await findAllProducts({limit,sort,page,filter, page,
        select: ['product_name', 'product_description', 'product_shop', 'product_price', 'product_thumb', 'product_ratingAverage', 'product_type', 'product_slug', 'product_images']
       })
    }

    static async findProduct ({product_id}) {
       return await findProduct({product_id, unSelect:['__v']})
    }

    static async findAllProductsByShop({ product_shop, limit = 6, skip = 0 }) {
        const query = { product_shop}   
        return await findAllProductsByShop({ query, limit, skip })

    }


}



//define base product class
class Product {
    constructor({
        product_name, product_thumb, product_images,
        product_description, product_price, product_quantity,
        product_type, product_shop, product_attributes, product_variation
    }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_images = product_images
        this.product_description = product_description
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
        this.product_variation = product_variation

    }

    //create new product
    async createProduct(product_id) {
        const newProduct =  await product.create({ ...this, _id: product_id })
        if(newProduct) {

            //add product stock in inventory
            await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity
            })

            // push notification
            pushNotiToSystem({
                type: TYPE_NOTIFICATIONS.SHOP_001,
                senderId: this.product_shop,
                receivedId: 1,
                options: {
                    product_name: this.product_name,
                    shop_name: this.product_shop
                }
            }).then(rs => console.log(rs)).catch(console.error)

        }
        return newProduct
    }

    async updateProduct(productId, bodyUpdate) {
        console.log("pro", bodyUpdate);
        return await updateProductById({productId, bodyUpdate, model: product})

    }
}

//Define sub-class for diffrent product types Clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create(this.product_attributes)
        const newVariationClothing = await variationClothing.create(this.product_variation)

        if (!newClothing) throw new BadRequestError(`Create new Clothing error`)

        const newProduct = await super.createProduct(newClothing._id)
        if (!newProduct) throw new BadRequestError(`Create new Product error`)

        return newProduct
    }

    async updateProduct(productId) {
        const objectParams = removeUndefinedObject(this)
        if(objectParams.product_attributes) {
             await updateProductById({productId, bodyUpdate: updateNestedObjectParse( objectParams.product_attributes), model: clothing})
        }

        if(objectParams.product_variation) {
            await updateProductById({productId, bodyUpdate: updateNestedObjectParse(objectParams.product_variation), model: clothing})
        }

        // if (objectParams.product_variation) {
        //     const newElement = this.product_variation[0]
        //     const findProduct = â
        //     objectParams.product_variation = [...objectParams.product_variation, newElement];
            
        // }

        const updateProduct = await super.updateProduct(productId, updateNestedObjectParse(objectParams))
        return updateProduct
    }
}


//Define sub-class for diffrent product types Electronic
class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({ ...this.product_attributes, product_shop: this.product_shop })
        if (!newElectronic) throw new BadRequestError(`Create new Electronics error`)

        const newProduct = await super.createProduct(newElectronic._id)
        if (!newProduct) throw new BadRequestError(`Create new Product error`)

        return newProduct
    }
}

//Define sub-class for diffrent product types Furniture


class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({ ...this.product_attributes, product_shop: this.product_shop })
        if (!newFurniture) throw new BadRequestError(`Create new Furniture error`)

        const newProduct = await super.createProduct(newFurniture._id)
        if (!newProduct) throw new BadRequestError(`Create new Product error`)

        return newProduct
    }
    async updateProduct(productId) {
        console.log("this", this);
        const objectParams = this
    
        if(objectParams.product_attributes) {
          return await updateProductById({productId, objectParams, model: furniture})
        }

        const updateProduct = await super.updateProduct(productId, objectParams)
        return updateProduct
    }
}

//register producttypes
ProductFactory.registerProductType('Electronics', Electronics)
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Furniture', Furniture)

module.exports = ProductFactory;