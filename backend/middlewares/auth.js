import User from "../models/userModel.js";

import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "./catchAsyncErrors.js";

// Checks if user is authenticated or not
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  // Get the token from the cookies sent with the request
  const { user_token } = req.cookies;

  if (!user_token) {
    return next(new ErrorHandler("Login first to access this resource.", 401));
  }

  // Verify the token using the secret key and set req.user to the user with the id decoded from the token
  const decoded = jwt.verify(user_token, process.env.USER_JWT_SECRET);
  req.user = await User.findById(decoded.id);

  next();
});

// Handling users roles
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
