const express = require('express');
const orderController = require('../controller/orderController');
const authController = require('../controller/authController');
const cookieParser = require('cookie-parser');


const router = express.Router();


// For reading the cookie in the protect() middleware method
router.use(cookieParser());


router.use(express.json());


// Made Authentication as Global Middleware for this route as it will be used by all the other routes before their controller getting
// executed
router.use(authController.protect);



router
.route("/")
.get(orderController.getOrderForUser)
.post(orderController.addOrder)


module.exports = router;