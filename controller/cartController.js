const Cart = require('../model/cartModel');


/*********************************Getting Cart Data for a parricular user***************************************/
exports.getCartData = async (req, res) => {
    try {
        if (req.params.id) {
            return res.status(400).send({
                status: '400 Bad Request',
                message: 'User Id should be provided'
            })
        }

        const cartData = await Cart.find({
            user: req.user._id.toString()
        });


        // const cartData = await Cart.find().where('user').equals(req.user._id.toString());


        if (cartData.length===0) {
            return res.status(400).send({
                status: '400 Bad Request',
                message: 'Cart Data not Present for this User'
            })
        }



        res.status(200).send({
            status: '200 OK',
            length: cartData.length,
            cartData
        });
    }
    catch (err) {
        res.status(500).send({
            status: '500 Internal Server Error',
            message: 'Problem for the backend'
        });
    }
}



/********************************Update the cart data just when user adds anything in cart*****************************************/
exports.updateCartData = async (req, res) => {
    try {
        if (JSON.stringify(req.body)==='{}') {
            return res.status(400).send({
                status: "400 Bad Request",
                message: "Cart Data Should be added"
            })
        }


        // Get the id 
        const id = req.user._id.toString()


        // Wrt to user id update the cart of the specified user
        const result = await Cart.updateOne({ user: id }, { $set: req.body }, { runValidators: true });


        if (result.acknowledged && result.modifiedCount > 0) {
            res.status(200).send({
                status: "200 OK",
                message: "Data Got Updated"
            })
        }
        else {
            res.status(400).send({
                status: "400 Bad Request",
                message: "Data Not got Updated as there is nothing new in the data"
            })
        }
    }
    catch (ex) {
        res.status(500).send({
            status: "500 Internal Server Error",
            message: "Problem with the server"
        })
    }
}