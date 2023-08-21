import express from "express";

import {
  googleLogin,
  registerUser,
  loginUser,
  logout,
  getUserProfile,
  updatePassword,
  updateProfile,
  allUsers,
  getUserDetails,
  updateUser,
  deleteUser,
} from "../controllers/authController.js";

import {
  forgotPasswordUser,
  resetPasswordUser,
} from "../controllers/passwordResetController.js";

const router = express.Router();

import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

// Authenticate user routes
router.route("/google-login").post(googleLogin);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Reset password routes
router.route("/password/forgot").post(forgotPasswordUser);
router.route("/password/reset/:token").put(resetPasswordUser);

// Unauthenticate user route
router.route("/logout").get(logout);

// Private / Authenticated user routes
router.route("/me").get(isAuthenticatedUser, getUserProfile);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);

// Admin routes
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getUserDetails)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUser)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

export default router;
