const express = require('express');
const foodRouter = require('./router/foodRouter')

const app = express();

app.use("/api/v1/bengalifood",foodRouter);

module.exports = app;