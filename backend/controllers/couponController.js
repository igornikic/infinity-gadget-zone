import Coupon from "../models/couponModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

// @desc    Create new coupon (Seller only)
// @route   POST /api/coupon/new
// @access  Seller
export const newCoupon = catchAsyncErrors(async (req, res, next) => {
  const { products, discountType, discountValue } = req.body;

  // Check if all products exist and belong to shop
  const foundProducts = await Product.find({
    _id: { $in: products },
    shopId: req.shop.id,
  });

  // Check if discountType is amount and discountValue is <= than the product price
  const invalidDiscount = foundProducts.some(
    (product) => discountType === "amount" && discountValue > product.price
  );

  if (invalidDiscount) {
    return next(
      new ErrorHandler(
        "Discount amount cannot be greater than product price",
        400
      )
    );
  }

  req.body.shopId = req.shop.id;

  const coupon = await Coupon.create(req.body);

  res.status(201).json({
    success: true,
    coupon,
  });
});

// @desc    Apply coupon to a product  (example: /api/coupon/apply?productId=658dad0fac4c8d58272469ea&code=2244-5678-2244)
// @route   GET /api/coupon/apply?
// @access  Private
export const applyCoupon = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // Send error if maximum coupon entry attempts have been exceeded and within expiry time
  if (
    user.couponAttempt.count >= 10 &&
    user.couponAttempt.expiry > Date.now()
  ) {
    return next(
      new ErrorHandler(
        "Exceeded maximum coupon attempts. Try again later.",
        400
      )
    );
  }

  // Reset coupon entry attempt count if expiry time has passed
  if (user.couponAttempt.expiry && user.couponAttempt.expiry <= Date.now()) {
    user.couponAttempt.count = 0;
  }

  // Find coupon
  const coupon = await Coupon.findOne({
    code: req.query.code,
    products: req.query.productId,
    expirationDate: { $gte: new Date() },
    numOfCoupons: { $gt: 0 },
  });

  // Check if the entered coupon code is correct
  if (!coupon) {
    await user.checkAndUpdateCouponAttempts();

    return next(
      new ErrorHandler(
        `Incorrect coupon code. Attempt ${user.couponAttempt.count}/10`,
        400
      )
    );
  } else {
    // Reset user's coupon entry attempts count and expiry time
    user.couponAttempt.count = undefined;
    user.couponAttempt.expiry = undefined;

    // Save updated user data to the database
    await user.save();
  }

  res.status(200).json({
    success: true,
    coupon,
  });
});

// @desc    Get coupon details by ID
// @route   GET /api/coupon/:id
// @access  Seller
export const getCouponDetails = catchAsyncErrors(async (req, res, next) => {
  const coupon = await Coupon.findOne({
    _id: req.params.id,
    shopId: req.shop.id,
  });

  if (!coupon) {
    return next(new ErrorHandler(`Coupon not found`, 404));
  }

  res.status(200).json({
    success: true,
    coupon,
  });
});

// @desc    Get all coupons of a shop
// @route   GET /api/coupons
// @access  Seller
export const getShopCoupons = catchAsyncErrors(async (req, res, next) => {
  const coupons = await Coupon.find({ shopId: req.shop.id });

  res.status(200).json({
    success: true,
    count: coupons.length,
    coupons,
  });
});

// @desc    Delete coupon by ID (Seller only)
// @route   DELETE /api/coupon/:id
// @access  Seller
export const deleteCoupon = catchAsyncErrors(async (req, res, next) => {
  // Find coupon by id
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(
      new ErrorHandler(`Coupon not found with id: ${req.params.id}`, 404)
    );
  }

  await Coupon.deleteOne({ _id: coupon._id });

  res.status(200).json({
    success: true,
    message: "Coupon Deleted successfully",
  });
});
