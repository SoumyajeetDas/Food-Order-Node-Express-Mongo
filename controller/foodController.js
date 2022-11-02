const Food = require('../model/foodModel')


/*******************************Get All foods sorted in descending order of rating*************************************/
exports.getAllFoods = async (req, res, next) => {

    try {
        const foodData = await Food.find().sort({ avgRating: -1 });

        if (foodData.length === 0) {
            return res.status(400).send({
                status: "400 Bad Request",
                message: "No Food Found"
            })
        }

        res.status(200).send({
            status: "200 OK",
            length: foodData.length,
            data: foodData
        });
    }
    catch (err) {
        if (process.env.NODE_ENV === 'production') {
            return res.status(500).send({
                status: "500 Internal Server Error",
                message: "Problem from the Database Side"
            });
        }
        res.status(500).send({
            status: "500 Internal Server Error",
            message: err.message
        });
    }

}


/******************Get the food depending on type like breakfast, lunch, dinner**********************/
exports.getFoodWithType = async (req, res, next) => {

    try {
        const foodData = await Food.find({ type: req.params.type }).sort({ avgRating: 1 });

        if (foodData.length === 0) {

            return res.status(400).send({
                status: "400 Bad Request",
                message: "No Food"
            })
        }

        res.status(200).send({
            status: "200 OK",
            length: foodData.length,
            data: foodData
        });
    }
    catch (err) {
        if (process.env.NODE_ENV === 'production') {
            return res.status(500).send({
                status: "500 Internal Server Error",
                message: "Problem from the Database Side"
            });
        }
        res.status(500).send({
            status: "500 Internal Server Error",
            message: err.message
        });
    }
}



/************************Get the food items depending on food name typed in search bar*******************************/
exports.search = async (req, res) => {
    try {
        const foodData = await Food.find({
            $or: [
                { "name": { $regex: req.params.key } }
            ]
        }).sort({name:1});

        res.status(200).send({
            status: "200 OK",
            length: foodData.length,
            data: foodData
        });
    }
    catch (err) {
        if (process.env.NODE_ENV === 'production') {
            return res.status(500).send({
                status: "500 Internal Server Error",
                message: "Problem from the Database Side"
            });
        }
        res.status(500).send({
            status: "500 Internal Server Error",
            message: err.message
        });
    }
}