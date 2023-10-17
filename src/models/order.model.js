'use strict'

const { Schema, mongoose } = require('mongoose');
const { enumOrderStatus } = require('../constants');

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Ordes'
// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({
    order_userId: {
        type: Number,
        require: true,
    },
    order_checkout: {
        type: Object,
        default: {}
    }, /*
         order_checkout: {
            totalPrice,
            feeShip
         }
       */
    order_shipping: {
        type: Object,
        default: {}
    },
    order_payment: {
        type: Object,
         default: {}
    }, 
    order_products: {
        type: Array,
        required: true
    },
    order_trackingNumber: {
        type: String,
        default: '#0000118052022'
    },
    order_status: {
        type: String,
        enum: enumOrderStatus,
        default: enumOrderStatus.PENDING
    }
    
}, {
    timestamps: {
        createdAt: 'createOn',
        updatedAt: 'modifiedOn'
    },
    collection: COLLECTION_NAME
});

//Export the model
module.exports = {
    order: mongoose.model(DOCUMENT_NAME, orderSchema),

}