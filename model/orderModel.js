const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    address: {
        type: String,
        required: [true, "Please enter the city"]
    },
    orders: {

        type: [
            {
                name: {
                    type:String,
                    required: [true, "Please enter the food name"]
                },
                amount: {
                    type:Number,
                    required: [true, "Please enter the amount"]
                },
                price: {
                    type:Number,
                    required: [true, "Please enter the price"]
                },
            }
        ],

        validate: {
            validator: function (val) {
                return Array.isArray(val) && val.length > 0
            },
            message: "Please enter the orders properly"
        }
    },
    
    totalPrice:{
        type:Number,
        required:[true,"Please provide the total Price"]
    },
    paymentStatus:{
        type:String,
        enum:['Success','Failed'],
        required:[true, "Please provide the paymentStatus and it should be either Success or Failed"]
    },
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:'Users',
        required: [true, "Order must belong to a User"]
    }

});

const Orders = mongoose.model('orders', orderSchema);

module.exports = Orders;