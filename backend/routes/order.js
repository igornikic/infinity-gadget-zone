import express from "express";

import {
  newOrder,
  getOrderDetails,
  getUserOrders,
  getShopOrders,
} from "../controllers/orderController.js";

const router = express.Router();

import {
  isAuthenticatedUser,
  isAuthenticatedSeller,
} from "../middlewares/auth.js";

// Private routes
router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, getOrderDetails);
router.route("/orders/me").get(isAuthenticatedUser, getUserOrders);

// Seller routes
router.route("/orders/shop").get(isAuthenticatedSeller, getShopOrders);

export default router;
