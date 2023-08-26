import express from "express";

import {
  newProduct,
  getProducts,
  getShopProducts,
  getProductDetails,
  allProducts,
  deleteProduct,
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
router.route("/shop/product/:id").delete(isAuthenticatedSeller, deleteProduct);

// Admin routes
router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allProducts);

router
  .route("/admin/product/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

export default router;
