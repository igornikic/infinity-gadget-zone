import { rest } from "msw";
import { productTestData as ptd } from "../../../test-data/product/productTestData";

export const newProductHandler = rest.post(
  "/api/product/new",
  (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        product: ptd,
      }),
      ctx.status(201)
    );
  }
);
