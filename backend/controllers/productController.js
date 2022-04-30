const Product = require("../models/productModels");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");

//Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

// Get All Product
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 5;
  const productCount = await Product.countDocuments();
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  // console.log("apifeature",apiFeature);
  const products = await apiFeature.query;
  res.status(200).json({
    success: true,
    products,
    productCount,
  });
});

//Get Product Details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

// Update Product --Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    product,
  });
});

// Delete Product

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  await product.remove();
  res.status(200).json({
    success: true,
    message: "Product Delete Successfully",
  });
});

// Create or update product review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  // console.log(req.user)
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  const product = await Product.findById(productId);
  const isReviewed = product.reviews.find(
    (rvw) => rvw.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rvw) => {
      if (rvw.user.toString() === req.user._id.toString()) {
        (rvw.rating = Number(rating)), (rvw.comment = comment);
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  let avgRating = 0;
  product.reviews.forEach((rvw) => {
    avgRating += rvw.rating;
  });
  product.ratings = avgRating / product.reviews.length;
  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    message: "Review Added Successfully",
  });
});

// Get all reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 400));
  }
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete product review
exports.deleteProductReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  // console.log(product)
  if (!product) {
    return next(new ErrorHandler("Product not found", 400));
  }
  const reviews = product.reviews.filter(
    (rvw) => rvw._id.toString() !== req.query.id.toString()
  );
  // console.log(reviews)
  let avgRating = 0;
  reviews.forEach((rvw) => {
    avgRating += rvw.rating;
  });
  const ratings = avgRating / reviews.length;
  const numOfReviews = reviews.length;
  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: "Review Deleted",
  });
});
