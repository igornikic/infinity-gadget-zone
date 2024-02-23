import { rest } from "msw";
import { couponTestData as ctd } from "../../../test-data/coupon/couponTestData";

export const applyCouponHandler = rest.get(
  "/api/coupon/apply",
  (req, res, ctx) => {
    return res(
      ctx.json({
        coupon: ctd,
      }),
      ctx.status(200)
    );
  }
);
