const { SuccessResponse } = require("../core/success.response");
const DiscountService = require('../services/discount.service')

class DiscountController {

    createDiscountCode = async(req,res,next) => {
        new SuccessResponse ({
            message: 'Create new discount code success',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res)
    }

    getAllDiscountCodes = async(req,res,next) => {
        new SuccessResponse ({
            message: 'Succesful Code Found',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId
            })
        }).send(res)
    }

    getDiscountAmount = async(req,res,next) => {
        new SuccessResponse ({
            message: 'Succesful Discount Amount Found',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body,
                
            })
        }).send(res)
    }

    getAllDiscountCodesWithProducts = async(req,res,next) => {
        new SuccessResponse ({
            message: 'getAllDiscountCodesWithProducts Found',
            metadata: await DiscountService.getAllDiscountCodesWithProduct({
                ...req.query           
            })
        }).send(res)
    }



   

    
}

module.exports = new DiscountController();
