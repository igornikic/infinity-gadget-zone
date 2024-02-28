import { rest } from "msw";
import { shopTestData } from "../../../test-data/shop/shopTestData";

export const shopUpdateHandler = rest.put(
  "/api/shop/me/update",
  (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        shop: {
          shopName: "Test Shop 2",
          shopEmail: "testemail@gmail.com",
          phoneNumber: 12345678,
          address: "USA, California, Los Angeles, 1 Main Street",
          zipCode: 1235,
          logo: shopTestData.logo,
        },
      }),
      ctx.status(200)
    );
  }
);

export const shopProfileHandler = rest.get("/api/shop/me", (req, res, ctx) => {
  return res(
    ctx.json({
      success: true,
      shop: {
        shopName: "Test Shop 2",
        shopEmail: "testemail@gmail.com",
        phoneNumber: 12345678,
        address: "USA, California, Los Angeles, 1 Main Street",
        zipCode: 1235,
        logo: shopTestData.logo,
      },
    }),
    ctx.status(200)
  );
});
