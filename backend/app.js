const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const errorMiddleWare = require("./middleware/error");
app.use(express.json());
app.use(cookieParser());

//Routes Import
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
app.use("/api/v1", product);
app.use("/api/v1", user);

//Middleware for Errors
app.use(errorMiddleWare);

module.exports = app;
