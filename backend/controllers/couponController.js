import Coupon from "../models/couponModel.js";
import Product from "../models/productModel.js";

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
    shop: req.shop.id,
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

  req.body.shop = req.shop.id;

  const coupon = await Coupon.create(req.body);

  res.status(201).json({
    success: true,
    coupon,
  });
});

// @desc    Get coupon details by ID
// @route   GET /api/coupon/:id
// @access  Public
export const getCouponDetails = catchAsyncErrors(async (req, res, next) => {
  const coupon = await Coupon.findOne({
    _id: req.params.id,
    shop: req.shop.id,
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
  const coupons = await Coupon.find({ shop: req.shop.id });

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
