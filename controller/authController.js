const User = require('../model/userModel');
const Cart = require('../model/cartModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');


let serverToken;


/***********************************Creating JWT Token and returning back*********************************/
const clientSideJwtToken = id => {

    // When the token is returned it is removing the Secret Key and then returning.
    return jwt.sign({ id }, process.env.Client_Side_JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRESIn
    });
}


const serverSideJwtToken = id => {
    return jwt.sign({ id }, process.env.Server_Side_JWT_SECRET, {
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
        newUser.email = undefined;


        //Creating Token
        const clientSideToken = clientSideJwtToken(newUser._id);
        const serverSideToken = serverSideJwtToken(newUser._id);


        // Adding a new Cart for the specified user
        const newCart = await Cart.create({
            items: [],
            totalPrice: 0,
            user: newUser._id
        });



        const cookieOptions = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRESIn * 24 * 60 * 60 * 1000),

            // secure:true, // Sends cookies only when the request is encrypted like https

            httpOnly: true // This prevents any script in the browser like JS to access and modify the cookie from the Browser. 
            // The cookie can only be accessed by the server like the Express Server here when request is happening from he server.
        }

        if (process.env.NODE_ENV === 'production') {
            cookie.secure = true; // For production making the secure as true
        }

        res.cookie('jwt', serverSideToken, cookieOptions)




        // Sending the token
        res.status(201).send({
            status: "201 Created successfully",
            data: {
                user: newUser,
                token: clientSideToken,
            },
            cart: newCart
        });

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
            const clientSideToken = clientSideJwtToken(user._id);
            const serverSideToken = serverSideJwtToken(user._id);



            user.password = undefined;
            user.email = undefined;


            const cookieOptions = {
                expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRESIn * 24 * 60 * 60 * 1000),

                // secure:true, // Sends cookies only when the request is encrypted like https

                httpOnly: true // This prevents any script in the browser like JS to access and modify the cookie from the Browser. 
                // The cookie can only be accessed by the server like the Express Server here when request is happening from he server.
            }

            // if (process.env.NODE_ENV === 'production') {
            //     cookie.secure = true; // For production making the secure as true
            // }

            res.cookie('jwt', serverSideToken, cookieOptions)



            // Sending the token
            res.status(200).send({
                status: "200 OK",
                data: {
                    user,
                    token: clientSideToken
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


    let clientToken;

    // Check if the token is present or not or is been passed in the header. 
    // When the request will come from frontend the req.headers.authorization will always be present with Bearer.
    // But from backend if we remove the token there will not be any.
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {


        // When coming from the frontend it is passed it will be string like 'Bearer  undefined'. Keep in mind there will be
        // an extra space before undefined. So we need to trim that space after splitting.
        clientToken = req.headers.authorization.split(' ')[1].trim();


        // After this it will become 'undefined'

        if (clientToken === 'undefined' || !clientToken) {
            return res.status(401).send({
                status: "401 Unauthorized",
                message: "Sorry you are not logged with verifyToken!!"
            })
        }



        // Verification of Token if somebody manipulated or not or already expired
        // The Token returned from login or regiser does not have the scret key. So during verification we have to pass the 
        // secret key as well to the verify() method.



        // This way of writing jwt.verify is the bst as it scronizes the flow otherwise it will throw error as next() will get
        // executed and then return res.status will get executed and that should not be the case
        const decoded = await promisify(jwt.verify)(clientToken, process.env.Client_Side_JWT_SECRET);


        // After logging if the user gets deleted but the JWT Token does not get expired then can access the whole application untill 
        // and unless JWT gets expired and is a security Breach.
        // So check whether user is present in the DB or not.
        let userData = await User.findById(decoded.id);


        if (!userData) {
            return res.status(401).send({
                status: "401 Unauthorized",
                message: "Sorry we couldn't verify it's you !!"
            })
        }

        else {
            serverToken = req.cookies.jwt;




            // client Token is verified now verification for the server Token
            if (!serverToken)
                return res.status(401).send({
                    status: "401 Unauthorized",
                    message: "Sorry you are not logged in with server token"
                })



            try {
                // Verification of Token if somebody manipulated or not or already expired
                // The Token returned from login or regiser does not have the scret key. So during verification we have to pass the 
                // secret key as well to the verify() method.
                const decoded = await promisify(jwt.verify)(serverToken, process.env.Server_Side_JWT_SECRET);


                // After logging if the user gets deleted but the JWT Token does not get expired then can access the whole application untill 
                // and unless JWT gets expired and is a security Breach.
                // So check whether user is present in the DB or not.
                const currentUser = await User.findById(decoded.id);


                if (!currentUser) {
                    return res.status(401).send({
                        status: "401 Unauthorized",
                        message: "Sorry we couldn't find you!!'"
                    })
                }


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
    }


    // If there is no req.header
    else {
        return res.status(401).send({
            status: "401 Unauthorized",
            message: "Sorry you are not logged in !!"
        })
    }

}




exports.logout = async (req, res, next) => {

    // const cookieOptions = {
    //     expires: new Date(Date.now() + 10 * 1000),

    //     // secure:true, // Sends cookies only when the request is encrypted like https

    //     httpOnly: true // This prevents any script in the browser like JS to access and modify the cookie from the Browser. 
    //     // The cookie can only be accessed by the server like the Express Server here when request is happening from he server.
    // }


    res.clearCookie('jwt');

    res.status(200).send({
        status: '200 OK',
        message: "Logged Out"
    })
}



exports.forgotPassword = async (req, res) => {
    try {
        const { email, password, confirmpassword } = req.body;

        if (!email || !password)
            return res.status(400).send({
                status: "400 Bad Request",
                message: "Please provide the username and password"
            })


        const userData = await User.findOne({ email });

        if (!userData) {
            return res.status(400).send({
                status: "400 Bad Request",
                message: "Please provide correct email address"
            })
        }

        userData.password = password;
        userData.confirmpassword = confirmpassword

        await userData.save();

        res.status(200).send({
            status: "200 OK",
            message: "Password has been updated. Please login now with the new password"
        })
    }

    catch (err) {
        if (process.env.NODE_ENV === 'production') {
            return res.status(500).send({
                status: "500 Internal Server Error",
                message: "Sorry !! Password Could not be updated"
            })
        }

        res.status(500).send({
            status: "500 Internal Server Error",
            message: err.message
        })

    }
}
