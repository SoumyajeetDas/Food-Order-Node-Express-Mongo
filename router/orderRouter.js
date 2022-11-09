const express = require('express');
const orderController = require('../controller/orderController');
const authController = require('../controller/authController');


const router = express.Router();

router.use(express.json());


// Made Authentication as Global Middleware for this route as it will be used by all the other routes before their controller getting
// executed
router.use(authController.protect);



router
.route("/")
.get(orderController.getOrderForUser)
.post(orderController.addOrder)


module.exports = router;