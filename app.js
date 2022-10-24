const express = require('express');
const foodRouter = require('./router/foodRouter');
const authRouter = require('./router/authRouter');
const cartRouter = require('./router/cartRouter')
const cors = require('cors')

const app = express();


app.use(cors({
    origin: "http://localhost:3000",
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));

app.use("/api/v1/bengalifood", foodRouter);
app.use("/api/v1/authenticate", authRouter);
app.use("/api/v1/cart", cartRouter);

app.all("*", (req, res) => {
    res.status(404).send({
        status: "404 Error",
        message: "Url not present"
    })
})


module.exports = app;