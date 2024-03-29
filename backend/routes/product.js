import express from "express";

import {
  newProduct,
  getProducts,
  getShopProducts,
  getProductDetails,
  createProductReview,
  getProductReviews,
  deleteReview,
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

//Review routes
router.route("/review").put(isAuthenticatedUser, createProductReview);
router
  .route("/reviews")
  .get(getProductReviews)
  .delete(isAuthenticatedUser, deleteReview);

// Seller routes
router.route("/product/new").post(isAuthenticatedSeller, newProduct);
router.route("/shop/product/:id").delete(isAuthenticatedSeller, deleteProduct);

// Admin routes
router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allProducts);
router
  .route("/admin/product/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);
router
  .route("/reviews")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteReview);

export default router;
