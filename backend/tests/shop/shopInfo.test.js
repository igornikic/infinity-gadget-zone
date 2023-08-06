import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "cloudinary";

import connectDatabase from "../../config/database.js";

// Setting up config file
dotenv.config({ path: "backend/config/config.env" });

// Setting up cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Variable to store seller token for seller account
let sellerToken;

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();

  // Authorize as Test seller
  const res = await request(app).post("/api/shop/login").send({
    shopEmail: "testShop@gmail.com",
    password: "123456789",
  });

  sellerToken = res.body.token;
});

// Disconnects from MongoDB database
afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET /api/shop/me", () => {
  it("should get seller shop", (done) => {
    request(app)
      .get("/api/shop/me")
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains shop
        expect(res.body).toHaveProperty("shop");
        expect(res.body.shop).toHaveProperty("shopName", "Test Shop2");

        done();
      });
  });

  it("should return error if you are not authenticated as seller", (done) => {
    request(app)
      .get("/api/shop/me")
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=""`])
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty(
          "message",
          "Login first to access this resource"
        );
        done();
      });
  });
});
