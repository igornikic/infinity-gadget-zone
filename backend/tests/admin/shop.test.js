import Shop from "../../models/shopModel.js";

import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "cloudinary";

import connectDatabase from "../../config/database.js";
import testLogo from "../../__mocks__/test-logo.js";

// Setting up config file
dotenv.config({ path: "backend/config/config.env" });

// Setting up cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Variable to store user token for admin account
let adminToken;

// Variable to store shop id
let shopId;

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();
  // Authorize as Admin
  const res = await request(app).post("/api/login").send({
    email: process.env.ADMIN_TEST_EMAIL,
    password: "sickPassword!",
  });
  adminToken = res.body.token;

  // Upload logo image to Cloudinary
  const result = await cloudinary.uploader.upload(testLogo, {
    folder: "IGZlogos",
    width: 150,
    crop: "scale",
  });

  // Insert shop for delete test and store id
  const insertShopRes = await Shop.create({
    shopName: "Test Shop6",
    shopEmail: "testShop6@gmail.com",
    password: "123456789",
    confirmPassword: "123456789",
    phoneNumber: "123456789",
    address: "123 Avenija 67",
    zipCode: "3456",
    logo: {
      public_id: result.public_id,
      url: result.secure_url,
    },
  });
  shopId = insertShopRes._id;
});

// Disconnects from MongoDB database
afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET /api/admin/shops", () => {
  it("should get all shops from database", (done) => {
    request(app)
      .get("/api/admin/shops")
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains shops
        expect(res.body).toHaveProperty("shops");

        done();
      });
  });
});

describe("DELETE /api/admin/shop/:id", () => {
  it("should delete shop from database", (done) => {
    request(app)
      .delete(`/api/admin/shop/${shopId}`)
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains success
        expect(res.body).toHaveProperty("success", true);

        done();
      });
  });

  it("should return error if there is no shop with this id", (done) => {
    request(app)
      .delete(`/api/admin/shop/64b510cc5c620d7bef933d5f`)
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 404 });
        expect(res.body).toHaveProperty(
          "message",
          "Shop not found with id: 64b510cc5c620d7bef933d5f"
        );

        done();
      });
  });
});
