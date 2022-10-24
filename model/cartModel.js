const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

    items: {
        type: [mongoose.SchemaTypes.Mixed]
    },
    totalPrice: Number,
    // Here it will store only 1 user.
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users', // Model Name : module.exports = Users;
        required: [true, "Cart must belong to a User"],
        unique: true
    }
});

let Cart = mongoose.model('cart', cartSchema);

module.exports = Cart;