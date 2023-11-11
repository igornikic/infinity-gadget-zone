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

export const loginHandler = rest.post("/api/login", (req, res, ctx) => {
  return res(
    ctx.json({
      success: true,
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YjdlY2E0YmEwNDNhNDk5OTAyYmQ4ZSIsImlhdCI6MTY5OTAzNDkzOSwiZXhwIjoxNjk5NjM5NzM5fQ.Pv3ipYozh0C_bd4k8ojdbhsVaJXxWxcsUX-1VE3IKtQ",
      user: userTestData,
      options: {
        expires: "2023-11-10T18:08:59.126Z",
        httpOnly: true,
        sameSite: "none",
        path: "/",
      },
    }),
    ctx.status(200)
  );
});

export const logoutHandler = rest.get("/api/logout", (req, res, ctx) => {
  return res(
    ctx.json({
      user: null,
      loading: false,
      isAuthenticated: false,
      error: null,
    }),
    ctx.status(200)
  );
});
