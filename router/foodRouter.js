const express = require('express');
const foodController = require('../controller/foodController');
const authController = require('../controller/authController');

const router = express.Router();

router.use(express.json());

// Made Authentication as Global Middleware for this route as it will be used by all the other routes before their controller getting
// executed
router.use(authController.protect)

router.get("/", foodController.getAllFoods)
router.get("/search/:key", foodController.search)
router.get("/:type", foodController.getFoodWithType)


module.exports = router;