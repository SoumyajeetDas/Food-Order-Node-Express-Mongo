const Rating = require('../model/ratingModel');

/******************************Add Rating**************************************/
exports.addRating = async (req, res, next) => {


    try {

        if (!req.body.tour) {


            req.body.foodId = req.params.foodId;

        }

        // When we login we have the user in the request so we can access the id of the user directly.
        if (!req.body.user) {
            req.body.userId = req.user._id;
        }


        const newRating = await Rating.create(req.body);

        res.status(201).send({
            status: "201 Created",
            data: {
                review: newRating
            }
        })
    }
    catch(err){

        if(process.env.NODE_ENV === 'production'){
            return res.status(500).send({
                status: "500 Internal Server Error",
                message:"Can not add review"
            })
        }
        res.status(500).send({
            status: "500 Internal Server Error",
            message: err.message
        })
    }

}