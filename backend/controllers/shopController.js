import Shop from "../models/shopModel.js";

import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import dotenv from "dotenv";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";
import sendShopToken from "../utils/shopToken.js";

// Setting up config file
dotenv.config({ path: "backend/config/config.env" });

// @desc    Create Shop
// @route   POST /api/seller/new
// @access  Public
export const newShop = catchAsyncErrors(async (req, res, next) => {
  const {
    shopName,
    shopEmail,
    password,
    confirmPassword,
    phoneNumber,
    address,
    zipCode,
    logo,
  } = req.body;

  // Check if the password and confirmPassword match
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  // Upload logo image to Cloudinary
  const result = await cloudinary.uploader.upload(logo, {
    folder: "IGZlogos",
    width: 150,
    crop: "scale",
  });

  try {
    // Create shop with provided data
    const shop = await Shop.create({
      shopName,
      shopEmail,
      password,
      confirmPassword,
      phoneNumber,
      address,
      zipCode,
      logo: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    // Generate and send activation email
    sendActivationEmail(shop, res);
  } catch (error) {
    // Delete logo from Cloudinary using the public_id
    await cloudinary.uploader.destroy(result.public_id);

    if (error.code === 11000 && error.keyPattern.shopName) {
      return next(new ErrorHandler("Shop name already taken", 409));
    } else if (error.code === 11000 && error.keyPattern.shopEmail) {
      return next(new ErrorHandler("Shop email already taken", 409));
    } else {
      return next(new ErrorHandler(error, 400));
    }
  }
});

// Function to send the activation email
const sendActivationEmail = async (shop, res) => {
  // Get activation token
  const activationToken = shop.getShopActivationToken();

  await shop.save();

  // Set frontend URL
  const frontendUrl = process.env.FRONTEND_URL;
  // Create activation URL
  const activationUrl = `${frontendUrl}/shop/activate/${activationToken}`;

  const message = `Please click on the link below to activate your shop:\n\n${activationUrl}\n\nIf you have not requested this email, then ignore it.`;

  try {
    await sendEmail({
      email: shop.shopEmail,
      subject: "Shop Activation",
      message,
    });

    res.status(201).json({
      success: true,
      message: `Email sent to: ${shop.shopEmail}`,
    });
  } catch (error) {
    shop.shopActivationToken = undefined;
    shop.shopActivationExpire = undefined;
    await shop.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
};

// @desc    Activate shop account
// @route   PUT /api/shop/activate/:token
// @access  Public
export const activateShop = catchAsyncErrors(async (req, res, next) => {
  // Hash URL token
  const activationToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // Find shop with provided activation token and within expiry time
  const shop = await Shop.findOne({
    shopActivationToken: activationToken,
    shopActivationExpire: { $gt: Date.now() },
  });

  if (!shop) {
    return next(
      new ErrorHandler("Activation token is invalid or has expired", 400)
    );
  }

  // Remove activation token and activate the shop account
  shop.shopActivationToken = undefined;
  shop.shopActivationExpire = undefined;
  shop.isActive = true;

  await shop.save();

  sendShopToken(shop, 200, res);
});

// @desc    Delete unactivated shop accounts
// @route   DELETE /api/shops
// @access  Private/Admin
export const deleteUnactivatedShops = catchAsyncErrors(
  async (req, res, next) => {
    // Find shops with expired activation time that are not activated
    const unactivatedShops = await Shop.find({
      shopActivationExpire: { $lt: Date.now() },
      isActive: false,
    });

    // Delete logos from cloudinary of unactivated shops
    unactivatedShops.map(async (shop) => {
      if (shop.logo && shop.logo.public_id) {
        await cloudinary.uploader.destroy(shop.logo.public_id);
      }
    });

    // Delete shops with expired activation time that are not activated
    await Shop.deleteMany({
      shopActivationExpire: { $lt: Date.now() },
      isActive: false,
    });

    res.status(200).json({
      success: true,
      deleted: unactivatedShops.length,
      message: "Expired shops and their logos deleted successfully",
    });
  }
);
