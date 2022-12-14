const Order = require('../model/orderModel');


/*******************************Get the Payment Order for an user*******************************************/
exports.getOrderForUser = async (req, res) => {
    try {
        const orderData = await Order.find({ userId: req.user._id }).sort({ dateOfOrder: -1, orderId: 1 });

        if (orderData.length === 0) {
            return res.status(400).send({
                status: '400 Bad Request',
                message: "No Order for this user"
            })
        }

        res.status(200).send({
            status: '200 OK',
            length: orderData.length,
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


/*******************************Just after payment add order with the userId*******************************************/
exports.addOrder = async (req, res) => {

    try {

        // Adding the userId for the particular user doing payment ordering
        req.body.userId = req.user._id;
        const orderData = await Order.create(req.body);

        if (!orderData) {
            return res.status(500).send({
                status: '500 Internal Server Error',
                order: err.message
            })
        }
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