const { SuccessResponse } = require("../core/success.response");
const ProductService = require('../services/product.service')
const ProductServiceV2 = require('../services/product.service.xxx')

class ProductController {

    createProduct = async(req,res,next) => {
        new SuccessResponse ({
            message: 'Create new product success',
            metadata: await ProductServiceV2.createProduct(req.body.product_type,{
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    findAllProductsByShop = async(req,res,next) => {
     
        new SuccessResponse ({
            message: ' findAllProductsByShop success',
            metadata: await ProductServiceV2.findAllProductsByShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    publishedProductByShop = async(req,res,next) => {
        new SuccessResponse ({
            message: 'publishedProductByShop Success',
            metadata: await ProductServiceV2.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    unPublishedProductByShop = async(req,res,next) => {
        new SuccessResponse ({
            message: 'unPublishedProductByShop Success',
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    //Query
    getAllDraftsForShop = async(req,res,next) => {
        new SuccessResponse({
            message: 'Get list draft success!',
            metadata: await ProductServiceV2.findAllDraftsForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getAllPulishedForShop = async(req,res,next) => {
        new SuccessResponse({
            message: 'Get list getAllPulishedForShop success!',
            metadata: await ProductServiceV2.findAllPulishedForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getListSearchProduct = async(req,res,next) => {
        new SuccessResponse({
            message: 'getListSearchProduct success!',
            metadata: await ProductServiceV2.searchProducts(req.params)
        }).send(res)
    }

    getAllProducts = async(req,res,next) => {
        new SuccessResponse({
            message: 'getAllProducts success!',
            metadata: await ProductServiceV2.findAllProducts(req.query)
        }).send(res)
    }
   
    getFindProduct = async(req,res,next) => {
        new SuccessResponse({
            message: 'getFindProduct success!',
            metadata: await ProductServiceV2.findProduct({product_id: req.params.product_id})
        }).send(res)
    }
   
    //End Query

    //update Product
    updateProduct = async(req, res, next) => {
        console.log("s", req.body);
        new SuccessResponse({
            message: 'Update Product Success!',
            metadata: await ProductServiceV2.updateProduct( 
                req.body.product_type,
                req.params.productId,
                {
                ...req.body,
                product_shop: req.user.userId
             })
        }).send(res)
    }

    
}

module.exports = new ProductController();
