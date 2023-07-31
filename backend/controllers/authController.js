import User from "../models/userModel.js";

import { v2 as cloudinary } from "cloudinary";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import dotenv from "dotenv";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";
import sendUserToken from "../utils/userToken.js";

// Setting up config file
dotenv.config({ path: "backend/config/config.env" });

const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID, null, {
  cookie_policy: "single_host_origin",
  cookie: {
    secure: true,
    sameSite: "none",
  },
});

// @desc    Authenticate user via Google login
// @route   POST /api/google-login
// @access  Public
export const googleLogin = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.body;

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
  });

  const { name, given_name, family_name, email, picture, jti } =
    ticket.getPayload();

  const existingUser = await User.findOne({ email });
  // Check if a user with the same email already exists
  if (existingUser) {
    sendUserToken(existingUser, 200, res);
  } else {
    // User does not exist, create token with the Google login information
    const user = {
      jti,
      username: name,
      firstName: given_name,
      lastName: family_name,
      email,
      avatar: {
        url: picture,
      },
      role: "user",
      // flag that will limit certain features on website (profile update, password change ...)
      isGuest: true,
    };
    sendUserToken(user, 200, res);
  }
});

// @desc    Register user
// @route   POST /api/register
// @access  Public
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { username, firstName, lastName, email, password, confirmPassword } =
    req.body;

  // Check if the password and confirmPassword match
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
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

// @desc    Request password reset
// @route   POST /api/password/forgot
// @access  Public
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Set the frontend URL
  const frontendUrl = process.env.FRONTEND_URL;
  // Create reset password url
  const resetUrl = `${frontendUrl}/password/reset/${resetToken}`;

  const message = `Your password reset token is:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// @desc    Reset password using a token
// @route   PUT /api/password/reset/:token
// @access  Public
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Hash URL token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Password reset token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  // Setup new password
  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

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

// @desc    Get user profile
// @route   GET /api/me
// @access  Private
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Change password
// @route   PUT /api/password/update
// @access  Private
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check previous user password
  const isMatched = await user.comparePassword(req.body.oldPassword);
  if (!isMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  // Verify new password
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password do not match", 400)
    );
  }

  // Check if new password is different
  if (
    req.body.oldPassword === req.body.password &&
    req.body.password === req.body.confirmPassword
  ) {
    return next(new ErrorHandler("Password change failed", 400));
  }

  user.password = req.body.password;
  await user.save();

  sendUserToken(user, 200, res);
});

// @desc    Update profile
// @route   PUT /api/me/update
// @access  Private
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const newUserData = {
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
  };

  // Check if avatar has changed
  if (req.body.avatar !== user.avatar.url) {
    // Find and delete existing avatar in cloudinary
    const image_id = user.avatar.public_id;
    await cloudinary.uploader.destroy(image_id);

    // Upload new avatar to cloudinary
    const result = await cloudinary.uploader.upload(req.body.avatar, {
      folder: "IGZavatars",
      width: 150,
      crop: "scale",
    });

    newUserData.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } else {
    // Use existing avatar
    newUserData.avatar = {
      public_id: user.avatar.public_id,
      url: user.avatar.url,
    };
  }

  // Update user by id
  const updatedUser = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user: updatedUser,
  });
});

// Admin Routes

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
export const allUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// @desc    Get user details by ID (Admin only)
// @route   GET /api/admin/user/:id
// @access  Private/Admin
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  // Find user by id
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User not found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Update user by ID (Admin only)
// @route   PUT /api/admin/user/:id
// @access  Private/Admin
export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    username: req.body.username,
    email: req.body.email,
    role: req.body.role,
  };

  // Update user by id
  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return next(
      new ErrorHandler(`User not found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Delete user by ID (Admin only)
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  // Find user by id
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User not found with id: ${req.params.id}`, 404)
    );
  }

  // Remove avatar from cloudinary
  const image_id = user.avatar.public_id;
  await cloudinary.uploader.destroy(image_id);

  await User.deleteOne({ _id: user._id });

  res.status(200).json({
    success: true,
  });
});
