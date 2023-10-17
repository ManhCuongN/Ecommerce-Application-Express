'use strict'

const { Schema, mongoose } = require('mongoose');
const slugify = require('slugify')
 // Erase if already required

const DOCUMENT_NAME='Product'
const COLLECTION_NAME='Products'

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    product_name:{
        type:String,
        required:true,
       
    },
    product_thumb:{
        type:String,
        required:true,
    },
    product_images: {
        type: Array,
        default: []
    },
    product_description:{
        type:String,
    },
    product_price:{
        type:Number,
        required:true,
    },
    product_quantity:{
        type:Number,
        required:true,
    },
    product_type:{
        type:String,
        required:true,
        enums: ['Clothing', 'Electronics', 'Furniture']
    },
    product_shop:{
        type:Schema.Types.ObjectId,
        ref: 'Shop'
    },
    product_attributes:{
        type:Schema.Types.Mixed,
        required:true,
    },
    //more
    product_slug: String,
    product_ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, "Rating must be above 1.0"],
        max: [5, "Rating must be aboce 5.0"],
        set: (val) => Math.round(val*10)/10
    },
    product_variation: {
        type:Schema.Types.Mixed,
        required:true,
    },
    isDraft: {type: Boolean, default: true, index: true, select: true},
    isPulished: {type: Boolean, default: false, index: true, select: false},

}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//create index
productSchema.index({product_name: 'text', product_description: 'text'})

//document middleware: runs before .save and create
productSchema.pre('save', function(next){
    this.product_slug = slugify(this.product_name,{lower: true})
    next()
})

//define the product type clothing
const clothingSchema = new Schema({
    brand: {type: String, required: true},
    size: String,
    material: String,
    product_shop: {type: Schema.Types.ObjectId, ref: "Shop"}
}, {
    collection: 'clothes',
    timestamps:true
})

//define the product type clothing
const variationClothingSchema = new Schema({
    size: {type: Array, default: []},
    color: {type: Array, default: []},
    product_shop: {type: Schema.Types.ObjectId, ref: "Shop"}
}, {
    collection: 'VariationClothing',
    timestamps:true
})

const electronicSchema = new Schema({
    manufacturer: {type: String, required: true},
    model: String,
    color: String,
    product_shop: {type: Schema.Types.ObjectId, ref: "Shop"}

}, {
    collection: 'electronics',
    timestamps:true
})

const furnitureSchema = new Schema({
    brand: {type: String, required: true},
    size: String,
    material: String,
    product_shop: {type: Schema.Types.ObjectId, ref: "Shop"}

}, {
    collection: 'furnitures',
    timestamps:true
})
//Export the model
module.exports = {
    product: mongoose.model(DOCUMENT_NAME, productSchema),
    electronic: mongoose.model('Electronics', electronicSchema),
    clothing: mongoose.model('Clothing', clothingSchema),
    furniture: mongoose.model('Furniture', furnitureSchema),
    variationClothing: mongoose.model('VariationClothing', variationClothingSchema)

}