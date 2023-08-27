import User from "../models/userModel.js";
import Shop from "../models/shopModel.js";
import Product from "../models/productModel.js";

import jwt from "jsonwebtoken";
import catchAsyncErrors from "./catchAsyncErrors.js";

// Check if user token is present in the request
const isUserTokenPresent = (req) => !!req.cookies.user_token;

// Check if seller token is present in the request
const isSellerTokenPresent = (req) => !!req.cookies.shop_token;

// Retrieve decoded token data from  model using given token and secret
const getTokenData = async (token, secret, Model) => {
  const decoded = jwt.verify(token, secret);
  return await Model.findById(decoded.id);
};

// Add view to product
const addViewToProduct = async (product, viewerId, currentTime) => {
  product.views.push({ viewerId, viewedAt: currentTime });
  await product.save();
};

// Check if view is valid based on viewerId and time within 7 days
const isViewValid = (view, decodedId, currentTime) => {
  return (
    view.viewerId === decodedId &&
    currentTime - view.viewedAt <= 7 * 24 * 60 * 60 * 1000
  );
};

// Calculate and update product views within the last 7 days
export const calculateViews = catchAsyncErrors(async (req, res, next) => {
  // Find product based on provided ID
  const product = await Product.findById(req.params.id);

  let decodedId = null;

  // Check if it's user or seller token and retrieve corresponding decoded ID
  if (isUserTokenPresent(req)) {
    const user = await getTokenData(
      req.cookies.user_token,
      process.env.USER_JWT_SECRET,
      User
    );
    decodedId = user.id;
  } else if (isSellerTokenPresent(req)) {
    const shop = await getTokenData(
      req.cookies.shop_token,
      process.env.SHOP_JWT_SECRET,
      Shop
    );
    decodedId = shop.id;
  }

  // Invalid token
  if (!decodedId) {
    return next();
  }

  // Get current time
  const currentTime = new Date();

  // Find existing view for product
  const existingView = product.views.find((view) =>
    isViewValid(view, decodedId, currentTime)
  );

  // If no existing view, add new view to product
  if (!existingView) {
    await addViewToProduct(product, decodedId, currentTime);
  }

  // Calculate seven days ago from the current time
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Filter product views to keep only those within the last 7 days
  product.views = product.views.filter((view) => view.viewedAt >= sevenDaysAgo);

  // Update the totalViews count for product
  product.totalViews = product.views.length;

  // Save the updated product
  await product.save();

  // Move to the next middleware
  next();
});
