import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import fileUpload from "express-fileupload";

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

// Application-level middlewares

// Middleware to handle errors

export default app;
