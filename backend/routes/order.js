import express from "express";

import { newOrder } from "../controllers/orderController.js";

const router = express.Router();

import { isAuthenticatedUser } from "../middlewares/auth.js";

// Seller routes
router.route("/order/new").post(isAuthenticatedUser, newOrder);

export default router;
