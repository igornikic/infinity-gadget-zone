import express from "express";

import { registerUser } from "../controllers/authController.js";

const router = express.Router();

// Authenticate user routes
router.route("/register").post(registerUser);

export default router;
