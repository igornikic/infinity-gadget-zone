import express from "express";

import {
  newCoupon,
  getShopCoupons,
  getCouponDetails,
  deleteCoupon,
} from "../controllers/couponController.js";

const router = express.Router();

import { isAuthenticatedSeller } from "../middlewares/auth.js";

// Seller routes
router.route("/coupon/new").post(isAuthenticatedSeller, newCoupon);
router.route("/coupons").get(isAuthenticatedSeller, getShopCoupons);
router
  .route("/coupon/:id")
  .get(isAuthenticatedSeller, getCouponDetails)
  .delete(isAuthenticatedSeller, deleteCoupon);

export default router;
