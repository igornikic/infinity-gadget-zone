import express from "express";

import {
  newOrder,
  getOrderDetails,
  getUserOrders,
} from "../controllers/orderController.js";

const router = express.Router();

import { isAuthenticatedUser } from "../middlewares/auth.js";

// Private routes
router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, getOrderDetails);
router.route("/orders/me").get(isAuthenticatedUser, getUserOrders);

export default router;
