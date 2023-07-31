import express from "express";

import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logout,
  getUserProfile,
  updatePassword,
  updateProfile,
  allUsers,
  getUserDetails,
  updateUser,
  deleteUser
} from "../controllers/authController.js";

const router = express.Router();

import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

// Authenticate user routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Reset password routes
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

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
