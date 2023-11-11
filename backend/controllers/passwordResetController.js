import User from "../models/userModel.js";
import Shop from "../models/shopModel.js";

import crypto from "crypto";
import dotenv from "dotenv";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";
import sendUserToken from "../utils/userToken.js";
import sendShopToken from "../utils/shopToken.js";

// Setting up config file
dotenv.config({ path: "config/config.env" });

// @desc    Send reset password email
// @route   POST /api/password/forgot
// @access  Public
const forgot = (Model, queryField, resetUrlPath) =>
  catchAsyncErrors(async (req, res, next) => {
    const frontendUrl = process.env.FRONTEND_URL;

    const errorMessage = `${Model.modelName} not found with this email`;

    const model = await Model.findOne({ [queryField]: req.body[queryField] });

    if (!model) {
      return next(new ErrorHandler(errorMessage, 404));
    }

    // Get reset token
    const resetToken = model.getResetPasswordToken();

    await model.save({ validateBeforeSave: false });

    const resetUrl = `${frontendUrl}${resetUrlPath}${resetToken}`;

    const message = `Your password reset token is:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

    try {
      await sendEmail({
        email: model[queryField],
        subject: "Password Recovery",
        message,
      });

      res.status(200).json({
        success: true,
        message: `Email sent to: ${model[queryField]}`,
      });
    } catch (error) {
      model.resetPasswordToken = undefined;
      model.resetPasswordExpire = undefined;

      await model.save({ validateBeforeSave: false });

      return next(new ErrorHandler(error.message, 500));
    }
  });

// Request password reset for shop account
export const forgotPasswordShop = forgot(
  Shop,
  "shopEmail",
  "/shop/password/reset/"
);
// Request password reset for user account
export const forgotPasswordUser = forgot(User, "email", "/password/reset/");

// @desc    Reset password using a token
// @route   PUT /api/password/reset/:token
// @access  Public
const reset = (Model) =>
  catchAsyncErrors(async (req, res, next) => {
    // Hash URL token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Find model based on reset password token
    const model = await Model.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!model) {
      return next(
        new ErrorHandler(
          "Password reset token is invalid or has been expired",
          400
        )
      );
    }

    // Check if the password and confirmPassword match
    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler("Passwords do not match", 400));
    }

    // Setup new password
    model.password = req.body.password;

    model.resetPasswordToken = undefined;
    model.resetPasswordExpire = undefined;

    await model.save();

    // Send appropriate token based on the model type

    if (Model === User) {
      sendUserToken(model, 200, res);
    }

    if (Model === Shop) {
      sendShopToken(model, 200, res);
    }
  });

// Password reset for shop account
export const resetPasswordShop = reset(Shop);
// Password reset for user account
export const resetPasswordUser = reset(User);
