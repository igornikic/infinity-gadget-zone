import express from "express";

import { newOrder, getOrderDetails } from "../controllers/orderController.js";

const router = express.Router();

import { isAuthenticatedUser } from "../middlewares/auth.js";

// Private routes
router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, getOrderDetails);

export default router;
