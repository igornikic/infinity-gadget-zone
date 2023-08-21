import User from "../models/userModel.js";
import Shop from "../models/shopModel.js";

import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "./catchAsyncErrors.js";

const authenticate = (tokenName, secretKey, Model) =>
  catchAsyncErrors(async (req, res, next) => {
    // Get token from cookies
    const token = req.cookies[tokenName];

    if (!token) {
      return next(new ErrorHandler(`Login first to access this resource`, 401));
    }

    // Verify token and set appropriate property on req
    const decoded = jwt.verify(token, secretKey);
    req[tokenName.replace("_token", "")] = await Model.findById(decoded.id);

    next();
  });

// Middleware to authenticate user
export const isAuthenticatedUser = authenticate(
  "user_token",
  process.env.USER_JWT_SECRET,
  User
);

// Middleware to authenticate seller
export const isAuthenticatedSeller = authenticate(
  "shop_token",
  process.env.SHOP_JWT_SECRET,
  Shop
);

// Handling roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role (${req.user.role}) is not allowed to acccess this resource`,
          403
        )
      );
    }
    next();
  };
};
