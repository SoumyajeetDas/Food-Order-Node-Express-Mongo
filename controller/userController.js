const User = require('../model/userModel');
const Order = require('../model/orderModel');


exports.getUserData = async (req, res) => {

    try {
        const userData = await User.findOne({ _id: req.user._id });

        const orderData = await Order.find({userId:req.user._id, paymentStatus:{$ne:"Failed"}});

        const orderNumber = orderData.length;

        if (!userData) {
            return res.status(400).send({
                status: '400 Bad Request',
                message: 'User Not Found'
            })
        }


        const { name, phone, address, email, password } = userData;

        res.status(200).send({
            status: "200 OK",
            data: {
                name,
                phone,
                address,
                email,
                orderNumber
            }

        })
    }

    catch (err) {

        if (process.env.NODE_ENV !== 'production') {
            return res.status(500).send({
                status: "500 Internal Server Error",
                message: err
            })
        }

        res.status(500).send({
            status: "500 Internal Server Error",
            message: 'Problem from the backend'
        })

    }


}