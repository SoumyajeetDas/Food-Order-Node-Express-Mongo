const mongoose = require('mongoose');


const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter the food"],
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, "Please enter the price"],
    },
    type: {
        type: String,
        required: [true, "Please enter the type"],
        enum: {
            values: ['Breakfast', 'Lunch', 'Dinner'],
            message: '{VALUE} is not suported'
        }
    },
    rating: {
        type: Number,
        max: [5, "Rating cannot be above 5"],
        min: [0, "Rating cannot be less than 1"],
        default: 0
    }
});


let Food = mongoose.model('foods', foodSchema);


module.exports = Food;