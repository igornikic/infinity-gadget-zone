import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import fileUpload from "express-fileupload";

import errorMiddleware from "./middlewares/errors.js";

const app = express();

// Load env variables with dotenv in DEVELOPMENT mode
if (process.env.NODE_ENV !== "PRODUCTION")
  dotenv.config({ path: "backend/config/config.env" });

app.use(
  fileUpload({
    limits: { fileSize: 1048576 },
    abortOnLimit: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());

// Importing all routes
import auth from "./routes/auth.js";
import shop from "./routes/shop.js";
import product from "./routes/product.js";
import coupon from "./routes/coupon.js";
import order from "./routes/order.js";

// Application-level middlewares
app.use("/api", auth);
app.use("/api", shop);
app.use("/api", product);
app.use("/api", coupon);
app.use("/api", order);

// Middleware to handle errors
app.use(errorMiddleware);

export default app;
