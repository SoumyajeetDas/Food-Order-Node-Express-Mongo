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
            values: ['Breakfast', 'Lunch', 'Dinner', 'Desserts'],
            message: '{VALUE} is not suported'
        }
    },
    avgRating: {
        type: Number,
        default: 0
    },
    imageUrl :{
        type:String,
        required:[true, "Please provide an image url"],
        trim:true
    }
});


let Food = mongoose.model('foods', foodSchema);


module.exports = Food;