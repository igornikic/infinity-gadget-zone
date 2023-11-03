import { rest } from "msw";
import { userTestData } from "../../../test-data/user/userTestData";

export const reigsterHandler = rest.post("/api/register", (req, res, ctx) => {
  return res(
    ctx.json({
      success: true,
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MjQzNjI2MmU1ZDI2MGNkMjZmZWI4OSIsImlhdCI6MTY5Njg3MTk3NSwiZXhwIjoxNjk3NDc2Nzc1fQ.uRPRdxEv3lisNGANqRZFwTJPz3mae5iY4-GglRaiIcA",
      user: userTestData,
      options: {
        expires: "2023-10-16T17:19:35.391Z",
        httpOnly: true,
        sameSite: "none",
        path: "/",
      },
    }),
    ctx.status(201)
  );
});
