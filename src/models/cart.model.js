'use strict'

const { Schema, mongoose } = require('mongoose');

const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'Carts'
// Declare the Schema of the Mongo model
var cartSchema = new mongoose.Schema({
    cart_state: {
        type: String,
        require: true,
        enum: ['active', 'completed', 'failed', 'pending'],
        default: 'active'
    },
    cart_products: {
        type: Array,
        required: true,
        default: []
    },
    cart_count_product: {
        type: Number,
        default: 0
    },
    cart_userId: {
        type: String,
        required: true
    }, 
    
}, {
    timestamps: {
        createdAt: 'createOn',
        updatedAt: 'modifiedOn'
    },
    collection: COLLECTION_NAME
});

//Export the model
module.exports = {
    cart: mongoose.model(DOCUMENT_NAME, cartSchema),

}