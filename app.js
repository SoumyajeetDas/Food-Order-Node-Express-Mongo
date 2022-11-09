const express = require('express');
const foodRouter = require('./router/foodRouter');
const authRouter = require('./router/authRouter');
const cartRouter = require('./router/cartRouter');
const ratingRouter = require('./router/ratingRouter');
const orderRouter = require('./router/orderRouter')
const cors = require('cors');
var helmet =require('helmet');



const app = express();

// For Security like XSS attacks, clickjacking, and other types of vulnerabilities
app.use(helmet());



// CORS POLICY
app.use(cors({
    origin: ["http://localhost:3000", 'https://bengali-food-webapp.netlify.app'],
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));


// Routes
app.use("/api/v1/bengalifood", foodRouter);
app.use("/api/v1/authenticate", authRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/review", ratingRouter);
app.use("/api/v1/order", orderRouter);


// Router for any type of routing for 404 error 
app.all("*", (req, res) => {
    res.status(404).send({
        status: "404 Error",
        message: "Url not present"
    })
})


module.exports = app;