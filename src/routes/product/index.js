'use strict'

const express = require('express')
const productController = require('../../controllers/product.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')
const router = express.Router()



router.get("/search/:keySearch",asyncHandler(productController.getListSearchProduct))
router.get("/",asyncHandler(productController.getAllProducts))
router.get("/:product_id",asyncHandler(productController.getFindProduct))


//authencation
router.use(authenticationV2)


router.post("/",asyncHandler(productController.createProduct))
router.patch("/:productId",asyncHandler(productController.updateProduct))
router.post("/published/:id",asyncHandler(productController.publishedProductByShop))
router.post("/unpublished/:id",asyncHandler(productController.unPublishedProductByShop))
router.get("/",asyncHandler(productController.getAllProducts))
router.get("/all/in",asyncHandler(productController.findAllProductsByShop))



//Query
router.get("/drafts/all",asyncHandler(productController.getAllDraftsForShop))
router.get("/published/all",asyncHandler(productController.getAllPulishedForShop))






module.exports = router
