const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  //Wrong Mongodb id error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid:${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose duplicate key errors
  if(err.code === 11000){
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered!`
    err = new ErrorHandler(message, 400);
  }

   //Wrong JWT error
   if (err.name === "JsonWebTokenError") {
    const message = `JWT token is invalid, Please try again.`;
    err = new ErrorHandler(message, 400);
  }

  //JWT expire error
  if (err.name === "TokenExpiredError") {
    const message = `JWT token is Expired, Please try again.`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
