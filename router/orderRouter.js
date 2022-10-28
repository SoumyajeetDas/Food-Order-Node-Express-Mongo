const express = require('express');
const orderController = require('../controller/orderController');
const authController = require('../controller/authController');


const router = express.Router();

router.use(express.json());

router
.route("/")
.get(authController.protect, orderController.getOrderForUser)
.post(authController.protect, orderController.addOrder)


module.exports = router;