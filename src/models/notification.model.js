'use strict'

const { Schema, mongoose } = require('mongoose');
const { TYPE_NOTIFICATIONS } = require('../constants');

const DOCUMENT_NAME = 'Notificaation'
const COLLECTION_NAME = 'Notificaations'
// Declare the Schema of the Mongo model
var notificationSchema = new mongoose.Schema({
    noti_type: {
       type: String, enum: TYPE_NOTIFICATIONS, required: true
    },
    noti_senderId: {
        type: Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    noti_receivedId: {
        type: String,
        required: true
    },
    noti_content: {
        type: String,
        required: true
    }, 
    noti_options: {
        type: Object,
        default: {}
    }
    
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = {
    Notification: mongoose.model(DOCUMENT_NAME, notificationSchema),

}