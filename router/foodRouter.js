const express = require('express');
const foodController = require('../controller/foodController');

const router = express.Router();

router.use(express.json());


router.get("/",foodController.getAllFoods)

module.exports = router;