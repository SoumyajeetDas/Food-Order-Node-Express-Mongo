const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs'); // Will be used for Hashing



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your UserName"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please enter your Email"],
        unique: true,
        trim: true,
        lowercase: true,
        validate:{
            validator:function(val){
                let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
                return validRegex.test(val)
            },
            message:"Please enter a valid email address"
        }

        // validate: [validator.isEmail, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, "Please enter your Password"],
        // minlength: [8, "Password should be of 8 characters"],
        select: false
    },
    confirmpassword: {
        type: String,
        required: [true, "Please Confirm your Password"],
        validate: {
            // The validator function works only for save() or create() as "this" works only when we create a new document.
            // We should not use arrow function for validator otherwise we cannot use "this to access the values"
            validator: function (val) {
                return val === this.password
            },
            message: "Password and Confirm Password does not match"
        }
    }
});



/******************Mongoose Document Middleware*********************/

// 'save' tells that the Middleware will work only for create() or save() commands. 
// 'pre' tells that the Middleware will run before saving the document into the DB
userSchema.pre('save', async function (next) {

    // Here 12 is the salt length, the more the salt length more encrypted the data will be. For now 12 is the best.
    // Insted of 12 we can give the salt strig as well.
    this.password = await bcrypt.hash(this.password, 12);


    this.confirmpassword = undefined; // Making it undefined and hence will not be saved in MongoDB.
})


/******************Instance Methods*********************/

// These are the methods that can be accessed for all the Document for the particular collection
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {


    // Once hashing done can't be reverted back. So candidatePassword is encryptrd by bycrypt algo and comapred with User Pasword
    return await bcrypt.compare(candidatePassword, userPassword); // Returns True or False
}


let Users = mongoose.model("users", userSchema);

module.exports = Users