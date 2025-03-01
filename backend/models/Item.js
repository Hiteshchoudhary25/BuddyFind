const { required } = require('joi');
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title :{
        type:String,
        required: true,
        trim:true 
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:String,
        enum:['lost' ,'found' ,'sell'],
        required:true 
    },
    images:[{
        type:String
    }],
    dateListed:{
        type:Date,
        default:Date.now
    },
    status:{
        type:String,
        enum:['unclaimed', 'claimed', 'sold'],
        default:'unclaimed'
    },
    listedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true 
    },
    university: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: function() {
          return this.category === 'sell';
        }
    },
    autoSellEligible: {
        type: Boolean,
        default: false
    },
    autoSellDate: {
        type: Date
    }
}, {
    timestamps:true
});

const Item = mongoose.model('Item' , itemSchema);

module.exports = Item;