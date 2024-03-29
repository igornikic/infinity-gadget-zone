import Shop from "../models/shopModel.js";

import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import dotenv from "dotenv";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";
import sendShopToken from "../utils/shopToken.js";

// Setting up config file
dotenv.config({ path: "config/config.env" });

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
      // Extract error messages from all fields
      const errorMessages = Object.values(error.errors)
        .map((err) => err.message)
        .join("\n");
      return next(new ErrorHandler(errorMessages, 400));
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

// @desc    Login shop
// @route   POST /api/shop/login
// @access  Public
export const loginShop = catchAsyncErrors(async (req, res, next) => {
  const { shopEmail, password } = req.body;

  // Check if shopEmail and password is entered by user
  if (!shopEmail || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  // Find shop in database
  const shop = await Shop.findOne({ shopEmail }).select("+password");

  if (!shop) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  // Check if password is correct or not
  const isPasswordMatched = await shop.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  // Check if shop exists and is not activated
  if (shop && !shop.isActive) {
    return next(
      new ErrorHandler(
        "Please activate your shop by clicking the link in the email we sent you",
        400
      )
    );
  }

  sendShopToken(shop, 200, res);
});

// @desc    Get Shop Info by ID
// @route   GET /api/shop/info/:id
// @access  Public
export const getShopInfo = catchAsyncErrors(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id).select(
    "logo shopName shopEmail phoneNumber address zipCode createdAt"
  );

  if (!shop) {
    return next(
      new ErrorHandler(`Shop not found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    shop,
  });
});

// @desc    Logout shop
// @route   GET /api/shop/logout
// @access  Public
export const logoutShop = catchAsyncErrors(async (req, res, next) => {
  // Set the token cookie to null and set the expires date to the current time
  res.cookie("shop_token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

// @desc    Get seller shop
// @route   GET /api/shop/me
// @access  Seller
export const getSellerShop = catchAsyncErrors(async (req, res, next) => {
  const shop = await Shop.findById(req.shop.id);

  res.status(200).json({
    success: true,
    shop,
  });
});

// @desc    Update shop
// @route   PUT /api/shop/me/update
// @access  Seller
export const updateShop = catchAsyncErrors(async (req, res, next) => {
  const shop = await Shop.findById(req.shop.id);

  const newShopData = {
    shopName: req.body.shopName,
    shopEmail: req.body.shopEmail,
    phoneNumber: req.body.phoneNumber,
    address: req.body.address,
    zipCode: req.body.zipCode,
  };

  // Update shop by id
  const updatedShop = await Shop.findByIdAndUpdate(req.shop.id, newShopData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  // Check if logo has changed
  if (req.body.logo !== shop.logo.url) {
    // Find and delete existing logo from cloudinary
    const image_id = shop.logo.public_id;
    await cloudinary.uploader.destroy(image_id);

    // Upload new logo to cloudinary
    const result = await cloudinary.uploader.upload(req.body.logo, {
      folder: "IGZlogos",
      width: 150,
      crop: "scale",
    });

    updatedShop.logo = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    // Save updated shop with new logo
    await updatedShop.save();
  }

  res.status(200).json({
    success: true,
    shop: updatedShop, // Remove in production
  });
});

// Admin Routes

// @desc    All shops (Admin only)
// @route   GET /api/shops
// @access  Private/Admin
export const allShops = catchAsyncErrors(async (req, res, next) => {
  const shops = await Shop.find();

  res.status(200).json({
    success: true,
    count: shops.length,
    shops,
  });
});

// @desc    Delete shop by ID (Admin only)
// @route   DELETE /api/admin/shop/:id
// @access  Private/Admin
export const deleteShop = catchAsyncErrors(async (req, res, next) => {
  // Find shop by id
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    return next(
      new ErrorHandler(`Shop not found with id: ${req.params.id}`, 404)
    );
  }

  // Remove logo from cloudinary
  const image_id = shop.logo.public_id;
  await cloudinary.uploader.destroy(image_id);

  await Shop.deleteOne({ _id: shop._id });

  res.status(200).json({
    success: true,
  });
});

// @desc    Delete unactivated shop accounts (Admin only)
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
