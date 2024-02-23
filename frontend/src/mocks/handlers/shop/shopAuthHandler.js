import { rest } from "msw";
import { shopTestData as std } from "../../../test-data/shop/shopTestData";

export const newShopHandler = rest.post("/api/shop/new", (req, res, ctx) => {
  return res(
    ctx.json({
      success: true,
      message: `Email sent to: ${std.shopEmail}`,
    }),
    ctx.status(201)
  );
});

export const loginShopHandler = rest.post(
  "/api/shop/login",
  (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YjdlY2E0YmEwNDNhNDk5OTAyYmQ4ZSIsImlhdCI6MTY5OTAzNDkzOSwiZXhwIjoxNjk5NjM5NzM5fQ.Pv3ipYozh0C_bd4k8ojdbhsVaJXxWxcsUX-1VE3IKtQ",
        shop: std,
        options: {
          expires: "2023-11-10T18:08:59.126Z",
          httpOnly: true,
          path: "/",
        },
      }),
      ctx.status(200)
    );
  }
);

export const activateShopHandler = rest.put(
  "/api/shop/activate/:token",
  (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YjdlY2E0YmEwNDNhNDk5OTAyYmQ4ZSIsImlhdCI6MTY5OTAzNDkzOSwiZXhwIjoxNjk5NjM5NzM5fQ.Pv3ipYozh0C_bd4k8ojdbhsVaJXxWxcsUX-1VE3IKtQ",
        shop: std,
        options: {
          expires: "2023-11-10T18:08:59.126Z",
          httpOnly: true,
          path: "/",
        },
      }),
      ctx.status(200)
    );
  }
);

export const logoutShopHandler = rest.get(
  "/api/shop/logout",
  (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
      }),
      ctx.status(200)
    );
  }
);
