import Shop from "../../models/shopModel.js";

import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";

import connectDatabase from "../../config/database.js";

// Setting up config file
dotenv.config({ path: "config/config.env" });

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();
});

// Disconnects from MongoDB database
afterAll(async () => {
  await mongoose.connection.close();
});

// Fixed reset token
const resetToken = "cf13e508491576c3b1e8d50e161024e18810af8b";

// Make fixed token valid for TestUser without getting actual from email
const setValidResetToken = async () => {
  // Hash the fixed test token as you would for a real token
  const hashedTestResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Store the hashed test reset token and a valid expiration time in the database for a TestShop
  const testShop = await Shop.findOne({
    shopEmail: process.env.SELLER_TEST_EMAIL,
  });

  const expirationTime = Date.now() + 60 * 60 * 1000;

  testShop.resetPasswordToken = hashedTestResetToken;
  testShop.resetPasswordExpire = expirationTime;

  await testShop.save();
};

describe("POST /api/shop/password/forgot", () => {
  it("should send recovery password email", (done) => {
    request(app)
      .post("/api/shop/password/forgot")
      .send({
        shopEmail: process.env.SELLER_TEST_EMAIL,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the success message
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty(
          "message",
          `Email sent to: ${process.env.SELLER_TEST_EMAIL}`
        );
        done();
      });
  });

  it("should return an error if there is not shop with this email in database", (done) => {
    request(app)
      .post("/api/shop/password/forgot")
      .send({
        shopEmail: "AAA123@gmail.com",
      })
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 404 });
        expect(res.body).toHaveProperty(
          "message",
          "Shop not found with this email"
        );
        done();
      });
  });
});

describe("PUT /api/shop/password/reset/:token", () => {
  it("should reset shop password", async () => {
    try {
      await setValidResetToken();

      const res = await request(app)
        .put(`/api/shop/password/reset/${resetToken}`)
        .send({
          shopEmail: process.env.SELLER_TEST_EMAIL,
          password: "reallygood!",
          confirmPassword: "reallygood!",
        })
        .expect(200);

      // Assert that the response contains a token
      expect(res.body).toHaveProperty("token");

      // Assert that the response contains shop
      expect(res.body).toHaveProperty("shop");
      expect(res.body.shop).toHaveProperty("shopName", "Test Shop4");

      // Assert that the response contains the options for the "shop_token" cookie
      expect(res.body).toHaveProperty("options");
      expect(res.body.options).toHaveProperty("expires");
      expect(res.body.options).toHaveProperty("httpOnly", true);
      expect(res.body.options).toHaveProperty("path", "/");
    } catch (error) {
      // Handle the error (e.g., log it or throw it again)
      throw error;
    }
  });

  it("should return an error if the reset password token is invalid or expired", (done) => {
    request(app)
      .put("/api/shop/password/reset/7372bc1599f6bf2b5e6ab5284a13692dc169e201")
      .send({
        shopEmail: process.env.SELLER_TEST_EMAIL,
        password: "12345678",
        confirmPassword: "12345678",
      })
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 400 });
        expect(res.body).toHaveProperty(
          "message",
          "Password reset token is invalid or has been expired"
        );
        done();
      });
  });

  it("should return an error if passwords do not match", async () => {
    try {
      await setValidResetToken();
      const res = await request(app)
        .put(`/api/shop/password/reset/${resetToken}`)
        .send({
          shopEmail: process.env.SELLER_TEST_EMAIL,
          password: "sickPassword!",
          confirmPassword: "sickPassword123!",
        })
        .expect(400);

      // Assert that the response contains the error message
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("error", { statusCode: 400 });
      expect(res.body).toHaveProperty("message", "Passwords do not match");
    } catch (error) {
      throw error;
    }
  });
});
