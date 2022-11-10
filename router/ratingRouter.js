const express = require('express');
const ratingController  = require('../controller/ratingController');
const authController = require('../controller/authController');
const cookieParser = require('cookie-parser');



const router = express.Router();



router.use(cookieParser());

router.use(express.json());


// Made Authentication as Global Middleware for this route as it will be used by all the other routes before their controller getting
// executed
router.use(authController.protect);


router.post("/addReview/:foodId", ratingController.addRating);


module.exports = router;