import { rest } from "msw";
import { userTestData } from "../../../test-data/user/userTestData";

export const profileUpdateHandler = rest.put(
  "/api/me/update",
  (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        user: {
          username: "Test",
          firstName: "Johny",
          lastName: "Do",
          email: "johnydo@gmail.com",
          avatar: userTestData.avatar,
        },
      }),
      ctx.status(200)
    );
  }
);

export const profileHandler = rest.get("/api/me", (req, res, ctx) => {
  return res(
    ctx.json({
      success: true,
      user: {
        username: "Test",
        firstName: "Johny",
        lastName: "Do",
        email: "johnydo@gmail.com",
        avatar: userTestData.avatar,
      },
    }),
    ctx.status(200)
  );
});

export const passwordUpdateHandler = rest.put(
  "/api/password/update",
  (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        user: userTestData,
      }),
      ctx.status(200)
    );
  }
);
