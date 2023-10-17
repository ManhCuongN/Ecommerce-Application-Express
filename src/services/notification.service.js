'use strict'
const {TYPE_NOTIFICATIONS} = require('../constants/index')
const {Notification} = require('../models/notification.model')

const pushNotiToSystem = async({
   type= TYPE_NOTIFICATIONS.SHOP_001,
   receivedId = 1,
   senderId = 1,
   options = {}
   
}) => {
    let noti_content
    if(type === TYPE_NOTIFICATIONS.SHOP_001) {
      noti_content = `@@ just added new product @@@@`
    } else if(type === TYPE_NOTIFICATIONS.PROMOTION_001) {
      noti_content = `@@@ just added new voucher @@@@`
    }
    
    const newNoti = await Notification.create({
      noti_type: type,
      noti_content,
      noti_senderId: senderId,
      noti_receivedId: receivedId,
      noti_options: options
    })

    return newNoti
}

module.exports = {
   pushNotiToSystem
}