import express from "express";

import {
  newCoupon,
  applyCoupon,
  getShopCoupons,
  getCouponDetails,
  deleteCoupon,
} from "../controllers/couponController.js";

const router = express.Router();

import {
  isAuthenticatedUser,
  isAuthenticatedSeller,
} from "../middlewares/auth.js";

// Private routes
router.route("/coupon/apply").get(isAuthenticatedUser, applyCoupon);

// Seller routes
router.route("/coupon/new").post(isAuthenticatedSeller, newCoupon);
router.route("/coupons").get(isAuthenticatedSeller, getShopCoupons);
router
  .route("/coupon/:id")
  .get(isAuthenticatedSeller, getCouponDetails)
  .delete(isAuthenticatedSeller, deleteCoupon);

export default router;
