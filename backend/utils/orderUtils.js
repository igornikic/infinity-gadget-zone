import Coupon from "../models/couponModel.js";
import Product from "../models/productModel.js";

import ErrorHandler from "./errorHandler.js";

const calculateItemPrice = (orderItem) =>
  (orderItem.price * orderItem.quantity).toFixed(2);

const calculateOrderPrices = async (order, isSellerOrder = false) => {
  // Calculate items price
  order.itemsPrice = order.orderItems
    .reduce((total, item) => total + parseFloat(calculateItemPrice(item)), 0)
    .toFixed(2);

  // Calculate tax price (10% of total item price fixed) for user orders
  if (!isSellerOrder) {
    order.taxPrice = (order.itemsPrice * 0.1).toFixed(2);
    order.shippingPrice = 10;
  } else {
    // For seller orders, set taxPrice and shippingPrice to undefined
    order.taxPrice = undefined;
    order.shippingPrice = undefined;
  }

  // Calculate total discount amount
  for (const orderItem of order.orderItems) {
    // Find coupon
    const coupon = await Coupon.findOne({
      code: orderItem.couponCode,
      products: orderItem.product,
      expirationDate: { $gte: new Date() },
      numOfCoupons: { $gt: 0 },
    });

    if (coupon) {
      let itemQuantityToDiscount = orderItem.quantity;

      // Check if we got enough coupons discount every unit, if not discount max possible
      if (coupon.numOfCoupons < itemQuantityToDiscount) {
        itemQuantityToDiscount = coupon.numOfCoupons;
        orderItem.couponsUsed = coupon.numOfCoupons;
        coupon.numOfCoupons = 0;
      } else {
        coupon.numOfCoupons -= itemQuantityToDiscount;
        orderItem.couponsUsed = itemQuantityToDiscount;
      }

      // Calculate item discount based on discount type
      const itemDiscount =
        coupon.discountType === "amount"
          ? coupon.discountValue * itemQuantityToDiscount
          : (coupon.discountValue / 100) *
            orderItem.price *
            itemQuantityToDiscount;

      orderItem.discountAmount += itemDiscount.toFixed(2);
      order.totalDiscount += parseFloat(itemDiscount.toFixed(2));

      await coupon.save();
    }

    // Update product stock and sold count
    if (!isSellerOrder) {
      const product = await Product.findById(orderItem.product);

      product.stock -= orderItem.quantity;
      product.sold += orderItem.quantity;

      await product.save();
    }
  }

  const calcTotalPrice = (
    parseFloat(order.itemsPrice) +
    (isSellerOrder ? 0 : parseFloat(order.taxPrice)) +
    (isSellerOrder ? 0 : order.shippingPrice) -
    order.totalDiscount
  ).toFixed(2);

  order.totalPrice = calcTotalPrice;
};

const groupOrderItemsBySeller = async (orderItems) => {
  // Initialize an array to store seller order groups
  const sellerOrderGroups = [];

  for (const orderItem of orderItems) {
    // Check if a coupon is valid for order item
    const coupon = await Coupon.findOne({
      code: orderItem.couponCode,
      products: orderItem.product,
      expirationDate: { $gte: new Date() },
      numOfCoupons: { $gt: 0 },
    });

    if (!coupon && orderItem.couponCode) {
      throw new ErrorHandler("Coupon is invalid or has expired", 400);
    }

    // Find product associated with order item
    const product = await Product.findById(orderItem.product);

    if (!product || product.stock === 0) {
      throw new ErrorHandler("Product not found", 404);
    }

    const shopId = product.shopId.toString();

    // Check if the seller group already exists in array
    const existingSellerGroup = sellerOrderGroups.find(
      (shop) => shop.shopId === shopId
    );

    if (!existingSellerGroup) {
      // If the seller group doesn't exist, create a new entry
      sellerOrderGroups.push({
        shopId,
        orderItems: [orderItem],
      });
    } else {
      // If the seller order group exists, add order item to it
      existingSellerGroup.orderItems.push(orderItem);
    }
  }

  return sellerOrderGroups;
};

export { calculateOrderPrices, groupOrderItemsBySeller };
