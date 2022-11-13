const mongoose = require('mongoose');
const User = require('./userModel');
const client = require('@sendgrid/mail');


const orderSchema = new mongoose.Schema({
    address: {
        type: String,
        required: [true, "Please enter the address"]
    },
    orders: {

        type: [
            {
                name: {
                    type: String,
                    required: [true, "Please enter the food name"]
                },
                amount: {
                    type: Number,
                    required: [true, "Please enter the amount"]
                },
                price: {
                    type: Number,
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

    dateOfOrder: {
        type: Date,
        default: Date.now
    },

    totalPrice: {
        type: Number,
        required: [true, "Please provide the total Price"]
    },
    paymentStatus: {
        type: String,
        enum: ['Success', 'Failed'],
        required: [true, "Please provide the paymentStatus and it should be either Success or Failed"]
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: [true, "Order must belong to a User"]
    },
    orderId: {
        type: String,
        default: "No Order Id Present"
    }

});


// Post Document Middleware for sending email after order is siccessfull.
orderSchema.post('save', async function () {

    const user = await User.find({ id: this.userId });
    // console.log(this.paymentStatus);

    if (this.paymentStatus === "Success") {
        client.setApiKey(process.env.SENDGRID_API_KEY);

        client.send({
            to: {
                email: user[0].email,
                name: user[0].name
            },
            from: {
                email: process.env.MY_SECRET_EMAIL,
                name: 'The Bengalis'
            },
            templateId: 'd-4762e2256c6e4d3092087b757255018e',
            dynamicTemplateData: {
                name: user[0].name,
                orderId: this.orderId
            }
        }).then(() => {
            console.log("Email Sent!!")
        }).catch((err) => {
            console.log(err);
        });
    }


    else if (this.paymentStatus === "Failed") {
        client.setApiKey(process.env.SENDGRID_API_KEY);

        client.send({
            to: {
                email: user[0].email,
                name: user[0].name
            },
            from: {
                email: process.env.MY_SECRET_EMAIL,
                name: 'The Bengalis'
            },
            templateId: 'd-dcb47f790076436983fe15feb8d56dbc',
            dynamicTemplateData: {
                name: user[0].name,
                orderId: this.orderId
            }
        }).then(() => {
            console.log("Email Sent!!")
        }).catch((err) => {
            console.log(err);
        });
    }

});

const Orders = mongoose.model('orders', orderSchema);

module.exports = Orders;