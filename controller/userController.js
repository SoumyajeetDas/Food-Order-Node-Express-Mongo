const User = require('../model/userModel');
const Order = require('../model/orderModel');
const cloudinary = require('cloudinary').v2;

exports.getUserData = async (req, res) => {

    try {
        // Finding the user Data
        const userData = await User.findById(req.user._id);

        // Finding the order Data for the particular user
        const orderData = await Order.find({ userId: req.user._id, paymentStatus: { $ne: "Failed" } });

        // After getting all the orders in the form of array of objects we get the no of orders by calling the length of the array.      
        const orderNumber = orderData.length;

        if (!userData) {
            return res.status(400).send({
                status: '400 Bad Request',
                message: 'User Not Found'
            })
        }


        const { name, phone, address, email, profilePic } = userData;

        res.status(200).send({
            status: "200 OK",
            data: {
                name,
                phone,
                address,
                email,
                profilePic,
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


// Adding the profile photo
exports.addProfilePhoto = async (req, res) => {

    try {

        if (!req.body || !req.body.profilePic) {
            return res.status(400).send({
                status: "400 Bad Request",
                message: "Please provide a url for profile picture"
            })
        }


        // Finding the user wrt id and updating the profilePic & profilrPicId of the user
        let user = await User.findByIdAndUpdate(req.user.id, { $set: req.body },
            {
                new: true,
                runValidators: true
            });

        
        // If the user is not found
        if (!user) {
            return res.status(400).send({
                status: "400 Bad Request",
                message: "User Not found"
            })
        }


        res.status(200).send({
            status: "200 OK",
            message: "Image updated successfully"
        })

    }

    catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            return res.status(500).send({
                status: "500 Internal Server Error",
                message: err.message
            })
        }

        return res.status(500).send({
            status: "500 Internal Server Error",
            message: "Problem from the backend"
        })
    }

}


exports.deleteProfilePic = async (req,res) => {

    try {

        // Finding the user
        let user = await User.findById(req.user._id);

        // Getting the publicId stored for the particular profilrPic image, which will be used gto delete the image from the
        // cloudinary.
        const publicId = user.profilePicId;

        // If there is no publicId stored in DB.
        if (!publicId) {
            return res.status(400).status({
                status: "400 Bad Request",
                message: "Profile Pic Id Not found"
            })
        }


        // Configuring the cloudinary
        cloudinary.config({ 
            cloud_name: process.env.CLOUD_NAME, 
            api_key: process.env.CLOUD_API_KEY, 
            api_secret: process.env.CLOUD_API_SECRET
          });
        

        // Code to delete the image from the cloudinary 
        await cloudinary.uploader.destroy(publicId);

        
        // Finding the user and updating the profilePic and profilePicId as '' 
        let userData = await User.findByIdAndUpdate(req.user.id, { $set: { profilePic: '', profilePicId: '' } },
            {
                new: true,
                runValidators: true
            });

        
        // If the user is not found
        if (!userData) {
            return res.status(400).send({
                status: "400 Bad Request",
                message: "User Not found"
            })
        }

        res.status(200).send({
            status: "200 OK",
            message: "Profile Pic Deleted"
        })
    }
    catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            return res.status(500).send({
                status: "500 Internal Server Error",
                message: err
            })
        }

        return res.status(500).send({
            status: "500 Internal Server Error",
            message: "Problem from the backend"
        })
    }

}