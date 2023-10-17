'use strict'

const { Schema } = require('mongoose');
const mongoose = require('mongoose'); // Erase if already required

const DOCUMENT_NAME='Shop'
const COLLECTION_NAME = 'Shops'
// Declare the Schema of the Mongo model
var shopSchema = new mongoose.Schema({
    name:{
        type:String,
        maxLength: 150,
        trim: true
    },
    email:{
        type:String,
        trim: true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        enum: ['active',  'inactive'],
        default: 'inactive'
    },
    verify:{
        type: Schema.Types.Boolean,
        default: false
    },
    roles:{
        type:Array,
        default: []
    },
},{
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, shopSchema);