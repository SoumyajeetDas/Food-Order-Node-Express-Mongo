const User = require('../model/userModel');
const Cart = require('../model/cartModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const sendEmail = require('../utils/email');
const client = require('@sendgrid/mail');




/***********************************Creating JWT Token and returning back*********************************/
// Creating JWT Token and returning back
const jwtToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRESIn
    });
}





/*******************************Sign Up API************************************/
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


        //Creating Token
        const token = jwtToken(newUser._id);


        // Adding a new Cart for the specified user
        const newCart = await Cart.create({
            items: [],
            totalPrice: 0,
            user: newUser._id
        });




        // Sending the token
        res.status(201).send({
            status: "201 Created successfully",
            data: {
                user: newUser,
                token,
            },
            cart: newCart
        });


        /****************************Sending Email To Client**************************/
        client.setApiKey(process.env.SENDGRID_API_KEY);

        client.send({
            to: {
                email: newUser.email,
                name: newUser.name
            },
            from: {
                email: process.env.MY_SECRET_EMAIL,
                name: 'The Bengalis'
            },
            templateId: 'd-14f9702cbb03466f8226254db4a1da7a',
            dynamicTemplateData: {
                name: newUser.name
            }
        }).then(() => {
            console.log("Email Sent!!")
        }).catch((err) => {
            console.log(err);
        })

    }
    catch (err) {

        if (process.env.NODE_ENV === 'production') {
            return res.status(500).send({
                status: "500 Internal Server Error",
                message: err.code === 11000 ? 'Duplicate' : "Could not register problem from the backend !!"
            })

        }
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


            //Creating Token
            const token = jwtToken(user._id);



            user.password = undefined;
            user.email = undefined;



            // Sending the token
            res.status(200).send({
                status: "200 OK",
                data: {
                    user,
                    token
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

        if (process.env.NODE_ENV === 'production') {
            return res.status(500).send({
                status: "500 Internal Server Error",
                message: "Could not Authorize. Problem from the backend !!"
            })
        }

        res.status(500).send({
            status: "500 Internal Server Error",
            message: err.message
        });
    }

};




// Checks whether the user is logged in or not



// Genarally the whole authentication should take place with the help of refresh token and acees token. But I didn't do in that way.
// I created two tokens in the backend. One is server Side JWT Token and another is client side JWT Token. The client side token
// gets stored into userRegisterData and in the cookie as well. And this token will be passed as Bearer token into all the requests.
// The server side token is registered as httpOnlyCookie.
// First when the request gets passed the client Side will go to the protect() route and it will be verified and then if it is 
// verified the server side token will be verified and then the request will be executed in the backend. 
// I feel if there is any changes made in the client side token there will be no problem as the backend will be ultimately get 
// authorized by the client token and that cannot be changed as it is httpOnlyCookie. 
exports.protect = async (req, res, next) => {


    let token;


    // Check if the token is present or not or is been passed in the header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

        token = req.headers.authorization.split(' ')[1].trim();


    }

    if (token === 'undefined') {
        return res.status(401).send({
            status: "401 Unauthorized",
            message: "You are not logged in !!"
        });
    }

    try {
        // Verification of Token if somebody manipulated or not or already expired
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);


        // After logging if the user gets deleted but the JWT Token does not get expired then can access the whole application untill 
        // and unless JWT gets expired and is a security Breach.
        // So check whether user is present in the DB or not.
        const currentUser = await User.findById(decoded.id);


        if (!currentUser)
            return res.status(401).send({
                status: "401 Unauthorized",
                message: "The user belonging to this token no longer exists"
            })


        req.user = currentUser; // This will be used by other middleware

        next();
    }

    catch (err) {

        if (process.env.NODE_ENV !== 'production') {
            return res.status(401).send({
                status: "401 Unauthorized",
                message: "Please login into your account!!"
            })
        }


        res.status(401).send({
            status: "401 Unauthorized",
            message: err.message
        })
    }

}




exports.forgotPassword = async (req, res, next) => {


    // Get user based on the email address
    const user = await User.findOne({ email: req.body.email }).select('+password');

    try {
        if (!user)
            return res.status(400).send({
                status: '400 Bad Request',
                message: "Requested email address not available"
            });


        const resetToken = user.createPasswordResetToken(); // We get an unencrypted long string from instance method explained in model



        // The passwordResetToken and passwordResetExpires instance Method in the userModel is not saved only instantiated so
        // with save() we are saving in the Mongo DB

        await user.save({ validateBeforeSave: false }); // Before save validation occurs, so to prevent that we use validateBeforeSave.
        // If not done will throw error as Password field is required.





        /****************************Testing Email**************************/


        //req.protocol tells http/https  req.get('host')tells like localhost:4000
        const resetUrl = `www.google.com with ${resetToken}`;


        const message = `Forgot your Password? Please change the email in ${resetUrl}. \n If you didn't forgot your password, please 
        ignore this email`;



        // We have to use try catch here otherwise we will not able to set the user.passwordResetToken & user.passwordResetExpires
        // when any error will happen.

        await sendEmail({
            email: user.email,
            subject: "Your password reset token will be valid for 10mins",
            message
        })




        /****************************Sending Email To Client**************************/
        client.setApiKey(process.env.SENDGRID_API_KEY);

        client.send({
            to: {
                email: user.email,
                name: user.name
            },
            from: {
                email: process.env.MY_SECRET_EMAIL,
                name: 'The Bengalis'
            },
            templateId: 'd-e49fda60cd68485d8ce58f25a8edb75f',
            dynamicTemplateData: {
                name: user.name,
                token: resetToken
            }
        }).then(() => {
            console.log("Token Email Sent!!")
        }).catch((err) => {
            console.log(err);
        })

        res.status(200).send({
            status: "200 OK",
            message: "Token sent to email!"
        })
    }
    catch (error) {

        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false })



        if (process.env.NODE_ENV === 'production') {
            return res.status(500).send({
                status: "500 Internal Server Error",
                message: "There was a problem from the backend. Please try again later"
            });
        }

        return res.status(500).send({
            status: "500 Internal Server Error",
            message: error.message
        });
    }

};



// This is reset Password who are not logged in
exports.resetPassword = async (req, res, next) => {

    try {
        // Encrypting the token coming from the id in the paramter
        const hashToken = crypto
            .createHash('sha256')
            .update(req.body.token)
            .digest('hex')


        // After encrypting need to find whether the encrypted Token is present in passwordResetToken or not and whether the 
        // passwordResetExpires is greater than the current date or not.
        const user = await User.findOne({
            passwordResetToken: hashToken,
            passwordResetExpires: { $gt: Date.now() }
        }).select('+password');

        if (!user) {
            return res.status(400).send({
                status: '400 Bad Request',
                message: "Token  has expired or wrong token"
            })
        }

        user.password = req.body.password;
        user.confirmpassword = req.body.confirmpassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;



        await user.save(); // The password will automaticaaly get hashed when it see the save() by the pre middleware in the userModel.js


        // Returning the token
        res.status(200).send({
            status: "200 OK",
            message: "Password updated successfully. Please login into your account"
        })
    }

    catch (error) {

        if (process.env.NODE_ENV === 'production') {
            return res.status(500).send({
                status: "500 Internal Server Error",
                message: "There was a problem from the backend. Please try again later"
            });
        }

        return res.status(500).send({
            status: "500 Internal Server Error",
            message: error.message
        });
    }


};