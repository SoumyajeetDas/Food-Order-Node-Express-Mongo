const User = require('../model/userModel');
const Cart = require('../model/cartModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');


// Creating JWT Token and returning back
const jwtToken = id => {

    // When the token is returned it is removing the Secret Key and then returning.
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRESIn
    });
}


exports.signup = async (req, res, next) => {


    try {
        if (!req.body.name) {
            return res.status(400).send({
                status: "400 Bad Request",
                message: 'Please provide user details'
            })
        }



        const newUser = await User.create(req.body);

        req.user = newUser; // This will be used by other middleware

        // We should not pass req.body as it will be a security breach. Whatever parameters we need should be specified separately. 
        // For eg: We have user model where role is default to user. If in the body user adds the role as Admin then create will take 
        // that req.body and will make user as Admin which is a security. But if we specify the field one by one within create then role
        // cannot be updated by the user.

        // const newUser = await User.create({
        //     name: req.body.name,
        //     email: req.body.email,
        //     password: req.body.password,
        //     confirmpassword: req.body.confirmpassword,

        // });


        newUser.password = undefined; // Password should not be shown to the client
        newUser.email = undefined;



        const token = jwtToken(newUser._id)     //Creating Token

        // const cart = {
        //     items:[],
        //     totalPrice:0
        // };

        // // When we login we have the user in the request so we can access the id of the user directly.
        // if (!req.body.user) {
        //     req.body.user = req.user._id;
        // }

        const newCart = await Cart.create({
            items:[],
            totalPrice:0,
            user: newUser._id
        });

        // Sending the token
        res.status(201).send({
            status: "201 Created successfully",
            data: {
                user: newUser,
                token,
            },
            cart:newCart
        });

    }
    catch (err) {
        res.status(500).send({
            status: "500 Internal Server Error",
            message: err.code === 11000 ? 'Duplicate' : err.message
        });
    }
};



exports.login = async (req, res, next) => {


    try {
        if (!req.body.email) {
            return res.status(400).send({
                status: "400 Bad Request",
                message: 'Please provide user details'
            })
        }
        const { email, password } = req.body;



        if (!email || !password)
            return res.status(400).send({
                status: "400 Bad Request",
                message: "Please provide the username and password"
            })


        const user = await User.findOne({ email }).select("+password")


        // user returns a document and on that Instance Method is executed.
        if (user && await user.correctPassword(password, user.password)) { // Checking for either user exists or not or password is incorrect

            // Creating Token
            const token = jwtToken(user._id)

            user.password = undefined;
            user.email = undefined;



            // Sending the token
            res.status(200).send({
                status: "200 OK",
                data: {
                    user,
                    token,
                }
            })
        }
        else {

            return res.status(401).send({
                status: "401 Unauthorized",
                message: "Please provide correct email address and password"
            })

        }
    }

    catch (err) {
        res.status(500).send({
            status: "500 Internal Server Error",
            message: err.message
        });
    }

};



// Checks whether the user is logged in or not
exports.protect = async (req, res, next) => {

    let token;


    // Check if the token is present or not or is been passed in the header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

        token = req.headers.authorization.split(' ')[1];
    }

    if (!token)
        return res.status(401).send({
            status: "401 Unauthorized",
            message: "Sorry you are not logged in!!"
        })



    try {
        // Verification of Token if somebody manipulated or not or already expired
        // The Token returned from login or regiser does not have the scret key. So during verification we have to pass the 
        // secret key as well to the verify() method.
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);


        // After logging if the user gets deleted but the JWT Token does not get expired then can access the whole application untill 
        // and unless JWT gets expired and is a security Breach.
        // So check whether user is present in the DB or not.
        const currentUser = await User.findById(decoded.id);


        if (!currentUser)
            return res.status(401).send({
                status: "401 Unauthorized",
                message: ""
            })


        req.user = currentUser; // This will be used by other middleware

        next();
    }
    catch (err) {

        if (process.env.NODE_ENV === 'production') {
            return res.status(401).send({
                status: "401 Unauthorized",
                message: "Not Authorized"
            })
        }

        res.status(401).send({
            status: "401 Unauthorized",
            message: err.message
        })


    };

}
