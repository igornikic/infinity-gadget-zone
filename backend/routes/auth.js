import express from "express";

import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logout,
} from "../controllers/authController.js";

const router = express.Router();

// Authenticate user routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Reset password routes
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

// Unauthenticate user route
router.route("/logout").get(logout);

export default router;
