const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');


const router = express.Router();



router.use(express.json());


// Made Authentication as Global Middleware for this route as it will be used by all the other routes before their controller getting
// executed
router.use(authController.protect);

router.get("/profile",userController.getUserData);
router.put("/profilepic",userController.addProfilePhoto);
router.get("/deleteprofilepic",userController.deleteProfilePic);

module.exports = router;
