import express from "express";

import {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
} from "../controllers/authController.js";

const router = express.Router();

// Authenticate user routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Reset password routes
router.route("/password/forgot").post(forgotPassword);

// Unauthenticate user route
router.route("/logout").get(logout);

export default router;
