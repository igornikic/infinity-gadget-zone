import express from "express";

import {
  newShop,
  activateShop,
  loginShop,
  logoutShop,
  getSellerShop,
  updateShop,
  deleteUnactivatedShops,
} from "../controllers/shopController.js";

const router = express.Router();

import {
  isAuthenticatedUser,
  isAuthenticatedSeller,
  authorizeRoles,
} from "../middlewares/auth.js";

// Public routes
router.route("/shop/new").post(newShop);
router.route("/shop/login").post(loginShop);
router.route("/shop/activate/:token").put(activateShop);

// Unauthenticate seller route
router.route("/shop/logout").get(logoutShop);

// Private routes
router.route("/shop/me").get(isAuthenticatedSeller, getSellerShop);
router.route("/shop/me/update").put(isAuthenticatedSeller, updateShop);

// Admin routes
router
  .route("/admin/shops")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUnactivatedShops);

export default router;
