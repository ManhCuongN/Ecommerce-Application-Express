'use strict'

const { Schema, mongoose } = require('mongoose');

const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'discounts'
// Declare the Schema of the Mongo model
var discountSchema = new mongoose.Schema({
    discount_name: {
        type: String,
        require: true
    },
    discount_description: {
        type: String,
        required: true
    },
    discount_type: {
        type: String,
        default: 'fixed_amount'
    },
    discount_max_value: {
        type: Number,
        required: true
    }, // 10.000, 10
    discount_code: {
        type: String,
        required: true
    },
    discount_start_date: {
        type: Date,
        require: true
    },
    discount_end_date: {
        type: Date,
        require: true
    },
    discount_max_uses: {
        type: Number,
        required: true
    },
    discount_user_count: {
        type: Number,
        required: true
    }, // so discount da su dung
    discount_users_used: {
        type: Array,
        required: []
    },// ai da su dungs
    discount_max_uses_per_user: {
        type: Number,
        required: true
    }, // so luong cho phep su dung user
    discount_min_order_value: {
        type: Number,
        required: true
    },
    discount_shopId: {
        type: Schema.Types.ObjectId,
        ref: "Shop",
    },
    discount_is_active: {
        type: Boolean,
        default: true
    },
    discount_applies_to: {
        type: String,
        required: true,
        enum: ['all', 'specific']
    },
    discount_product_ids: {
        type: Array,
        default: []
    }// so san pham dc ap dung
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = {
    discount: mongoose.model(DOCUMENT_NAME, discountSchema),

}