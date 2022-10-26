const express = require('express');
const ratingController  = require('../controller/ratingController');
const authController = require('../controller/authController');


const router = express.Router();

router.use(express.json());


router.post("/addReview/:foodId",authController.protect, ratingController.createReview);


module.exports = router;