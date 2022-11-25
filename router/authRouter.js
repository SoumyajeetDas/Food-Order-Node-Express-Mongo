const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const authController = require('../controller/authController');




const router = express.Router();

// Middleware

router.use(express.json())


// Prevents from No Sql Injections
router.use(mongoSanitize());


//Authentication Router
router
    .post("/signup", authController.signup)
    .post("/login", authController.login)
    .post("/forgotPassword", authController.forgotPassword)
    .post("/resetPassword/",authController.resetPassword)
    



module.exports = router;