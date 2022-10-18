const express = require('express');
const foodController = require('../controller/foodController');

const router = express.Router();

router.use(express.json());


router.get("/", foodController.getAllFoods)
router.get("/search/:key", foodController.search)
router.get("/:type", foodController.getFood)


module.exports = router;