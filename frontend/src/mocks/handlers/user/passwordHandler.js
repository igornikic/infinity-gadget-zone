import { rest } from "msw";

export const forgotPasswordHandler = rest.post(
  "/api/password/forgot",
  (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: "Email sent to: test@gmail.com",
      }),
      ctx.status(200)
    );
  }
);
