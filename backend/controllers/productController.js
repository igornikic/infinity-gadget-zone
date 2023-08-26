import Product from "../models/productModel.js";
import Shop from "../models/shopModel.js";
import { v2 as cloudinary } from "cloudinary";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { search, filter, pagination } from "../utils/queryFeatures.js";

// @desc    Create new product (Seller only)
// @route   POST /api/product/new
// @access  Private/Seller
export const newProduct = catchAsyncErrors(async (req, res, next) => {
  const shop = await Shop.findById(req.body.shop);

  if (!shop) {
    return next(new ErrorHandler("Shop not found", 404));
  }

  // Get array of images from req body
  const images = req.body.images;
  // Variable to store Cloudinary image links
  let imagesLinks = [];

  // Loop through provided images and upload them to Cloudinary
  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.uploader.upload(images[i], {
      folder: "IGZproducts",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  // Replace images in req body with uploaded image links
  req.body.images = imagesLinks;

  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    // If product creation fails, delete uploaded images from Cloudinary
    imagesLinks.forEach(async (image) => {
      await cloudinary.uploader.destroy(image.public_id);
    });
    return next(error);
  }
});

// @desc    Get all products (example: /api/products?keyword=laptop&price[gte]=1&price[lte]=3&page=1)
// @route   GET /api/products?
// @access  Public
export const getProducts = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 20;

  // Initialize the query
  let query = Product.find();

  // Apply search, filter and pagination features
  query = search(query, req.query);
  query = filter(query, req.query);
  query = pagination(query, req.query, resPerPage);

  // Get final products list
  const products = await query;

  // Get total count of products after filtering
  const filteredProductsCount = products.length;

  res.status(200).json({
    success: true,
    resPerPage,
    filteredProductsCount,
    products,
  });
});

// @desc    Get all shop products (example: /api/products/shop/:id?keyword=laptop&price[gte]=1&price[lte]=3&page=1&sort=-views)
// @route   GET /api/products/shop/:id?
// @access  Public
export const getShopProducts = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 20;

  const shop = await Shop.findById(req.params.id);
  if (!shop) {
    return next(new ErrorHandler("Shop not found", 404));
  }

  let query = Product.find({ shop });

  // Apply search, filter, and pagination features
  query = search(query, req.query);
  query = filter(query, req.query);
  query = pagination(query, req.query, resPerPage);

  // Get final products list
  const products = await query;

  // Get total count of products after filtering
  const filteredProductsCount = products.length;

  res.status(200).json({
    success: true,
    resPerPage,
    filteredProductsCount,
    products,
  });
});

// @desc    Get Product Details by ID
// @route   GET /api/product/:id
// @access  Public
export const getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// @desc    Create new product review
// @route   PUT /api/review
// @access  Private
export const createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    username: req.user.username,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return next(
      new ErrorHandler(`Product not found with id: ${productId}`, 404)
    );
  }

  // Check if user has already reviewed this product
  const isReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  // Update review if user has already reviewed product, if not add a new review
  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  // Calcule average rating for product
  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
  });
});

// @desc    Get product reviews
// @route   GET /api/reviews?id=
// @access  Private
export const getProductReviews = catchAsyncErrors(async (req, res, next) => {
  // Find product using provided product ID in query parameter
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Admin Routes

// @desc    All products (Admin only)
// @route   GET /api/shops
// @access  Private/Admin
export const allProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    count: products.length,
    products,
  });
});

// @desc    Delete product by ID (Admin/Seller)
// @route   DELETE Seller (/api/shop/product/:id) Admin (/api/admin/product/:id)
// @access  Private/Admin/Seller
export const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  // Find product by id
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorHandler(`Product not found with id: ${req.params.id}`, 404)
    );
  }

  // Only admins or authorized shop owner can delete this product.
  if (
    (req.shop && req.shop.id && req.shop.id !== product.shop.toString()) ||
    (req.user && req.user.role !== "admin")
  ) {
    return next(
      new ErrorHandler("You are not authorized to delete this product", 403)
    );
  }

  // Deleting images associated with the product
  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.uploader.destroy(product.images[i].public_id);
  }

  await Product.deleteOne({ _id: product._id });

  res.status(200).json({
    success: true,
    message: "Product Deleted successfully",
  });
});
