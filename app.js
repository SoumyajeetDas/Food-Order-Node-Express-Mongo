const express = require('express');
const foodRouter = require('./router/foodRouter');
const cors = require('cors')

const app = express();


app.use(cors({
    origin:"http://localhost:3000",
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));

app.use("/api/v1/bengalifood",foodRouter);

app.all("*", (req, res) => {
    res.status(404).send({
        status: "404 Error",
        message: "Url not present"
    })
})


module.exports = app;