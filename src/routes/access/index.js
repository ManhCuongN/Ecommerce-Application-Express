'use strict'

const express = require('express')
const accessController = require('../../controllers/access.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')
const router = express.Router()


//signup
router.post('/shop/signup',asyncHandler(accessController.signUp))
router.post('/shop/login',asyncHandler(accessController.login))


//authencation
router.use(authenticationV2)

router.post('/shop/logout',asyncHandler(accessController.logout))
router.get('/shop/getInfo/:id',asyncHandler(accessController.getInfo))
router.post('/shop/handlerRefreshToken',asyncHandler(accessController.handlerRefreshToken))



module.exports = router
