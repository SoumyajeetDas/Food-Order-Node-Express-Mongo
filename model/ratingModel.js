const mongoose = require('mongoose');
const Food = require('./foodModel')



const ratingSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required:[true, "Rating should be provided"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    // Here it will store only 1 tour.
    foodId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Food', // Model Name : module.exports = Tours;
        required: [true, "Review must belong to a Tour"]
    },

    // Parent Referencing 

    // Here it will store only 1 user.
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users', // Model Name : module.exports = Users;
        required: [true, "Review must belong to a User"]
    }
});


/******************Static Methods*********************/

// Static method can able to access the whole model with 'this' keyword. With statis method we can perform operations
// at Model level.

ratingSchema.statics.calcAvgRating = async function (foodId) {
    const data = await this.aggregate([
        {
            $match: {
                foodId: foodId
            },

        },
        {
            $group: {
                _id: '$foodId',
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    await Food.findByIdAndUpdate(foodId, {
        avgRating:data[0].avgRating
    });

}


/******************Mongoose Document Middleware*********************/
ratingSchema.post('save', function(){

    // constructor gets the access on the Reviews Model over which the static method will be called
    this.constructor.calcAvgRating(this.foodId);
});


let Ratings = mongoose.model("ratings", ratingSchema);

module.exports = Ratings;