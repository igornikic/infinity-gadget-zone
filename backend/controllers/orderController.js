import Order from "../models/orderModel.js";
import Shop from "../models/shopModel.js";

import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import {
  calculateOrderPrices,
  groupOrderItemsBySeller,
} from "../utils/orderUtils.js";

// @desc    Create new order
// @route   POST /api/order/new
// @access  Private
export const newOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderItems, shippingInfo, paymentInfo } = req.body;

  // Group order items by shop
  const sellerOrderGroups = await groupOrderItemsBySeller(orderItems);

  // Create user order
  const userOrder = await Order.create({
    orderItems,
    shippingInfo,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user.id,
  });

  // Calculate prices for user order
  await calculateOrderPrices(userOrder);

  // Save user order to database
  await userOrder.save();

  // Create orders for each seller and calculate prices for them
  const createdOrders = [];

  for (const orderData of sellerOrderGroups) {
    const { shopId, orderItems: sellerOrderItems } = orderData;

    // Create seller order
    const sellerOrder = await Order.create({
      orderItems: sellerOrderItems,
      shippingInfo,
      paymentInfo,
      paidAt: Date.now(),
      user: req.user.id,
      shopId: shopId,
    });

    // Calculate order prices for seller without tax and shipping
    await calculateOrderPrices(sellerOrder, true);

    // Save seller's order to database
    await sellerOrder.save();

    // Store created seller orders
    createdOrders.push(sellerOrder);
  }

  res.status(201).json({
    success: true,
    userOrder,
    // sellerOrders: createdOrders,
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

// @desc    Get Shop Orders
// @route   GET /api/orders/shop
// @access  Seller
export const getShopOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ shopId: req.shop.id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

// @desc    Update Order
// @route   PUT /api/order/:id
// @access  Seller
export const updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this id", 404));
  }

  // Check if order is already delivered
  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("Order already delivered", 400));
  }

  // If new order status is Delivered, update delivery and payment status
  if (req.body.orderStatus === "Delivered") {
    order.deliveredAt = Date.now();
    order.paymentInfo.status = "Succeeded";

    // Find the associated shop and update its available balance
    const shop = await Shop.findById(req.shop.id);
    shop.availableBalance += order.totalPrice;

    await shop.save();
  }

  // Update order status
  order.orderStatus = req.body.orderStatus;

  // Save updated order
  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

// @desc    Delete order by ID
// @route   DELETE /api/order/:id
// @access  Seller
export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  // Find order by id
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorHandler(`Order not found with id: ${req.params.id}`, 404)
    );
  }

  await Order.deleteOne({ _id: order._id });

  res.status(200).json({
    success: true,
    message: "Order Deleted successfully",
  });
});
