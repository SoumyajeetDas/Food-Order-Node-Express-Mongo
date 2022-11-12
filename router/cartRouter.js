const express = require('express');
const cartController = require('../controller/cartController');
const authController = require('../controller/authController');



const router = express.Router();



router.use(express.json());


// Made Authentication as Global Middleware for this route as it will be used by all the other routes before their controller getting
// executed
router.use(authController.protect);


router.get("/getCart", cartController.getCartData);
router.put('/updateCart', cartController.updateCartData);

module.exports = router;


