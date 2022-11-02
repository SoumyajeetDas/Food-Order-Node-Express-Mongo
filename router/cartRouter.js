const express = require('express');
const cartController = require('../controller/cartController');
const authController = require('../controller/authController')


const router = express.Router();


router.use(express.json()) 


router.get("/getCart",authController.protect, cartController.getCartData);
router.put('/updateCart',authController.protect,cartController.updateCartData);

module.exports = router;


