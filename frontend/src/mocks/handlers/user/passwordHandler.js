import { rest } from "msw";
import { userTestData } from "../../../test-data/user/userTestData";

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

export const resetPasswordHandler = rest.put(
  "/api/password/reset/:token",
  (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NzkwMzQ0NzU4ZWRhODQ3ZmE2ODk1ZiIsImlhdCI6MTY5OTcxMTYyMiwiZXhwIjoxNzAwMzE2NDIyfQ.qsc7H6aBOPMMWqUwGHMrsGYvzwu41Zj6xPhlcTEZp5s",
        user: userTestData,
        options: {
          expires: "2023-11-18T14:07:02.839Z",
          httpOnly: true,
          path: "/",
        },
      }),
      ctx.status(200)
    );
  }
);
