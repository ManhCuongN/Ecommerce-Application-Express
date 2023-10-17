'use strict'

const { Schema, mongoose } = require('mongoose');

const DOCUMENT_NAME = 'Comment'
const COLLECTION_NAME = 'Comments'
// Declare the Schema of the Mongo model
var commmentSchema = new mongoose.Schema({
    comment_productId: {
       type: Schema.Types.ObjectId, ref: 'Product'
    },
    comment_userId: {
        type: String,
        default: 1
    },
    comment_content: {
        type: String,
        default: 'text'
    },
    comment_left: {
        type: Number,
        default: 0
    }, 
    comment_right: {
        type: Number,
        default: 0
    }, 
    comment_parentId: {
        type: Schema.Types.ObjectId, ref: DOCUMENT_NAME,
    }, 
    isDeleted: {
        type: Boolean,
        default: false
    }, 
    
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = {
    Comment: mongoose.model(DOCUMENT_NAME, commmentSchema),

}