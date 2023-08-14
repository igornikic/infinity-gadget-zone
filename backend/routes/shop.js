import express from "express";

import {
  newShop,
  activateShop,
  loginShop,
  logoutShop,
  getSellerShop,
  getShopInfo,
  updateShop,
  allShops,
  deleteShop,
  deleteUnactivatedShops,
} from "../controllers/shopController.js";

import {
  forgotPasswordShop,
  resetPasswordShop,
} from "../controllers/passwordResetController.js";

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
router.route("/shop/info/:id").get(getShopInfo);

// Reset password routes
router.route("/shop/password/forgot").post(forgotPasswordShop);
router.route("/shop/password/reset/:token").put(resetPasswordShop);

// Unauthenticate seller route
router.route("/shop/logout").get(logoutShop);

// Private routes
router.route("/shop/me").get(isAuthenticatedSeller, getSellerShop);
router.route("/shop/me/update").put(isAuthenticatedSeller, updateShop);

// Admin routes
router
  .route("/admin/shops")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allShops)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUnactivatedShops);
router
  .route("/admin/shop/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteShop);

export default router;
