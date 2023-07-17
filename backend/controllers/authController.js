import User from "../models/userModel.js";

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendUserToken from "../utils/userToken.js";

// Setting up config file
dotenv.config({ path: "backend/config/config.env" });

// @desc    Register user
// @route   POST /api/register
// @access  Public
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { username, firstName, lastName, email, password, confirmPassword } =
    req.body;

  // Check if the password and confirmPassword match
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  // Upload the avatar image to Cloudinary
  const result = await cloudinary.uploader.upload(req.body.avatar, {
    folder: "IGZavatars",
    width: 150,
    crop: "scale",
  });
  try {
    // Create a new user with the provided data
    const user = await User.create({
      username,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      avatar: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    // Generate and send the JWT token
    sendUserToken(user, 201, res);
  } catch (error) {
    // Delete avatar from Cloudinary using the public_id
    await cloudinary.uploader.destroy(result.public_id);

    if (error.code === 11000 && error.keyPattern.username) {
      return next(new ErrorHandler("Username already taken", 409));
    } else if (error.code === 11000 && error.keyPattern.email) {
      return next(new ErrorHandler("Email already taken", 409));
    } else {
      return next(new ErrorHandler(error, 400));
    }
  }
});

// @desc    Login user
// @route   POST /api/login
// @access  Public
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password is entered by user
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  // Find user in database
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  // Check if password is correct or not
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  sendUserToken(user, 200, res);
});

// @desc    Logout user
// @route   GET /api/logout
// @access  Public
export const logout = catchAsyncErrors(async (req, res, next) => {
  // Set the token cookie to null and set the expires date to the current time
  res.cookie("user_token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});
