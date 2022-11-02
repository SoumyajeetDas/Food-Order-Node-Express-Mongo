const express = require('express');
const foodRouter = require('./router/foodRouter');
const authRouter = require('./router/authRouter');
const cartRouter = require('./router/cartRouter');
const ratingRouter = require('./router/ratingRouter');
const orderRouter = require('./router/orderRouter')
const cors = require('cors')

const app = express();


app.use(cors({
    origin: ["http://localhost:3000",'https://bengali-food-webapp.herokuapp.com', 'https://main--sprightly-flan-76b02a.netlify.app'],
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));

app.use("/api/v1/bengalifood", foodRouter);
app.use("/api/v1/authenticate", authRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/review", ratingRouter);
app.use("/api/v1/order", orderRouter);

app.all("*", (req, res) => {
    res.status(404).send({
        status: "404 Error",
        message: "Url not present"
    })
})


module.exports = app;