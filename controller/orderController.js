const Order = require('../model/orderModel');


exports.getOrderForUser = async (req, res) => {
    try {
        const orderData = await Order.find({userId:req.user._id});

        if (orderData.length === 0) {
            return res.status(400).send({
                status: '400 Bad Request',
                message: "No Order for this user"
            })
        }

        res.status(200).send({
            status: '200 OK',
            length:orderData.length,
            orderData
        });
    }
    catch (err) {

        if (process.env.NODE_ENV === 'production') {
            res.status(500).send({
                status: '500 Internal Server Error',
                message: "Some problem from the backend!!"
            })
        }
        res.status(500).send({
            status: '500 Internal Server Error',
            message: err.message
        })
    }
}


exports.addOrder = async (req, res) => {

    try {
        req.body.userId = req.user._id;
        const orderData = await Order.create(req.body);


        res.status(201).send({
            status: '201 Created',
            order: orderData
        })
    }
    catch (err) {
        res.status(500).send({
            status: '500 Internal Server Error',
            order: err.message
        })
    }

}