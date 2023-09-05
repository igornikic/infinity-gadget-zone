import Coupon from "../models/couponModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

// Function to calculate order prices
const calculateOrderPrices = async (order) => {
  // Calculate items price
  order.itemsPrice = order.orderItems
    .reduce((total, item) => total + item.price * item.quantity, 0)
    .toFixed(2);

  // Calculate tax price (10% of total item price fixed)
  order.taxPrice = (order.itemsPrice * 0.1).toFixed(2);

  // Fixed shipping price, 10 euros
  order.shippingPrice = 10;

  // Calculate total discount amount
  let totalDiscountAmount = 0;

  for (const orderItem of order.orderItems) {
    const coupon = await Coupon.findOne({
      code: orderItem.couponCode,
      products: orderItem.product,
      expirationDate: { $gte: new Date() },
      numOfCoupons: { $gt: 0 },
    });

    // Throw error if coupon code is provided and not valid
    if (!coupon && orderItem.couponCode) {
      throw new ErrorHandler("Coupon is invalid or has expired", 400);
    }

    const product = await Product.findById(orderItem.product);

    if (!product) {
      throw new ErrorHandler("Product not found", 404);
    }

    // Update product stock and sold count
    product.stock -= orderItem.quantity;
    product.sold += orderItem.quantity;

    await product.save();

    if (coupon) {
      // Calculate total discount amount based on discount type
      let itemQuantityToDiscount = orderItem.quantity;

      if (coupon.numOfCoupons < itemQuantityToDiscount) {
        itemQuantityToDiscount = coupon.numOfCoupons;
        coupon.numOfCoupons = 0;
      } else {
        coupon.numOfCoupons -= itemQuantityToDiscount;
      }

      // Calculate item discount based on discount type
      const itemDiscount =
        coupon.discountType === "amount"
          ? coupon.discountValue * itemQuantityToDiscount
          : (coupon.discountValue / 100) *
            orderItem.price *
            itemQuantityToDiscount;

      orderItem.discountAmount += itemDiscount.toFixed(2);
      totalDiscountAmount += parseFloat(itemDiscount.toFixed(2));

      await coupon.save();
    }
  }

  // Calculate total price including discounts
  const calcTotalPrice = (
    parseFloat(order.itemsPrice) +
    parseFloat(order.taxPrice) +
    order.shippingPrice -
    totalDiscountAmount
  ).toFixed(2);

  order.totalPrice = calcTotalPrice;
};

// @desc    Create new order
// @route   POST /api/order/new
// @access  Private
export const newOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderItems, shippingInfo, paymentInfo } = req.body;

  // Create order
  const order = await Order.create({
    orderItems,
    shippingInfo,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user.id,
  });

  // Calculate order prices
  await calculateOrderPrices(order);

  // Save order to database
  await order.save();

  res.status(201).json({
    success: true,
    order,
  });
});

// @desc    Get Order Details by ID
// @route   GET /api/order/:id
// @access  Private
export const getOrderDetails = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id,
  }).populate("user", "username email");

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// @desc    Get User Orders
// @route   GET /api/orders/me
// @access  Private
export const getUserOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    orders,
  });
});
