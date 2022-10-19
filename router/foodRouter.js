const express = require('express');
const foodController = require('../controller/foodController');
const authController = require('../controller/authController');

const router = express.Router();

router.use(express.json());


router.get("/", authController.protect, foodController.getAllFoods)
router.get("/search/:key", authController.protect, foodController.search)
router.get("/:type", authController.protect, foodController.getFood)


module.exports = router;