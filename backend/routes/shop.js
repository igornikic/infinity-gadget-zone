import express from "express";

import {
  newShop,
  activateShop,
  loginShop,
  deleteUnactivatedShops,
  logoutShop,
} from "../controllers/shopController.js";

const router = express.Router();

import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

// Public routes
router.route("/shop/new").post(newShop);
router.route("/shop/login").post(loginShop);
router.route("/shop/activate/:token").put(activateShop);

// Unauthenticate user route
router.route("/shop/logout").get(logoutShop);

// Private routes

// Admin routes
router
  .route("/admin/shops")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUnactivatedShops);

export default router;
