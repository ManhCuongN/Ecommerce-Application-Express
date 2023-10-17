const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {

    handlerRefreshToken = async(req,res,next) => {
        // new SuccessResponse ({
        //     message: 'Get token success',
        //     metadata: await AccessService.handlerRefresh(req.body.refreshToken)

        // }).send(res)

        //V2
        new SuccessResponse ({
            message: 'Get token success',
            metadata: await AccessService.handlerRefreshV2({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore
            })

        }).send(res)
    }

    login = async (req, res, next) => {
        new SuccessResponse({
            message: 'Login Succesfully',
            metadata: await AccessService.login(req.body)
        }).send(res);
    }
  
    signUp = async (req, res, next) => {   
        new CREATED({
            message: 'Register Shop Success',
            metadata: await AccessService.signUp(req.body)
        }).send(res);
    }

    logout = async(req,res,next) => {
        
        new SuccessResponse({
            message: 'Logout Success!!',
            metadata: await AccessService.logout(req.keyStore )
        }).send(res)
    }

    getInfo = async(req,res,next) => {
       
        new SuccessResponse({
            message: 'Get Info Success!!',
            metadata: await AccessService.getInfoShop(req.params)
        }).send(res)
    }
}

module.exports = new AccessController();
