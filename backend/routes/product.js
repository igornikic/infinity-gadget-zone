import express from "express";

import {
  newProduct,
  getProducts,
  getShopProducts,
  getProductDetails,
} from "../controllers/productController.js";

const router = express.Router();

import {
  isAuthenticatedUser,
  isAuthenticatedSeller,
  authorizeRoles,
} from "../middlewares/auth.js";

import { calculateViews } from "../middlewares/views.js";

// Public routes
router.route("/products").get(getProducts);
router.route("/products/shop/:id").get(getShopProducts);
router.route("/product/:id").get(calculateViews, getProductDetails);

// Private/Seller routes
router.route("/product/new").post(isAuthenticatedSeller, newProduct);

export default router;
