import express from "express";

import { newProduct, getProducts } from "../controllers/productController.js";

const router = express.Router();

import {
  isAuthenticatedUser,
  isAuthenticatedSeller,
  authorizeRoles,
} from "../middlewares/auth.js";

// Public routes
router.route("/products").get(getProducts);

// Private/Seller routes
router.route("/product/new").post(isAuthenticatedSeller, newProduct);

export default router;
