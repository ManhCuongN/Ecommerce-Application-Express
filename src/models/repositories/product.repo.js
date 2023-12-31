'use strict'

const { product, electronic, clothing, furniture } = require('../../models/product.model')
const { Types } = require('mongoose')
const {getSelectData, unGetSelectData, convertToObjectIdMongodb} = require('../../utils/')
const findAllDraftsForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const findAllPulishedForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const findAllProductsByShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const searchProductByUser = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch)
    const results = await product.find({
        isPulished: true,
        $text: { $search: regexSearch }
    },
        { score: { $meta: 'textScore' } }
    ).sort({score: {$meta: 'textScore'}}).lean()
    return results
}


const publishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    });

    if (!foundShop) return null;

    foundShop.isDraft = false;
    foundShop.isPulished = true;

    await foundShop.save(); // Use save() to update the document

    return 1; // Assuming you're returning 1 on successful update
}

const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    });

    if (!foundShop) return null;

    foundShop.isDraft = true;
    foundShop.isPulished = false;

    await foundShop.save(); // Use save() to update the document

    return 1; // Assuming you're returning 1 on successful update
}

const findAllProducts = async({limit, sort, page, filter, select}) => {
     const skip = (page - 1) * limit
     const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1}
     const products = await product.find(filter)
     .sort(sortBy)
     .skip(skip)
     .limit(limit)
     .select(getSelectData(select))
     .lean()
  

     return products
}

const findProduct = async({product_id, unSelect}) => {
    return await product.findById(product_id).select(unGetSelectData(unSelect))
}


const queryProduct = async ({ query, limit, skip }) => {
    return await product.find(query).
        populate('product_shop', 'name email -_id')
        .sort({ updateAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
}

const updateProductById = async({productId, bodyUpdate, model, isNew = true}) => {
    return await model.findByIdAndUpdate(productId, bodyUpdate,{new: isNew})
}

const getProductById = async(productId) => {
    return await product.findOne({_id: convertToObjectIdMongodb(productId)}).lean()
}


module.exports = {
    findAllDraftsForShop,
    publishProductByShop,
    findAllPulishedForShop,
    unPublishProductByShop,
    searchProductByUser, 
    findAllProducts,
    findProduct, 
    updateProductById,
    getProductById, 
    findAllProductsByShop
}