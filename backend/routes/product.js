import express from "express";

import { newProduct } from "../controllers/productController.js";

const router = express.Router();

import {
  isAuthenticatedUser,
  isAuthenticatedSeller,
  authorizeRoles,
} from "../middlewares/auth.js";

// Private/Seller routes
router.route("/product/new").post(isAuthenticatedSeller, newProduct);

export default router;
