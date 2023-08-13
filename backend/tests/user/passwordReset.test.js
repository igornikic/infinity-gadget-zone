import User from "../../models/userModel.js";

import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";

import connectDatabase from "../../config/database.js";

// Setting up config file
dotenv.config({ path: "backend/config/config.env" });

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();
});

// Disconnects from MongoDB database
afterAll(async () => {
  await mongoose.connection.close();
});

// Fixed reset token
const resetToken = "7372bc1599f6bf2b5e6ab5284a13692dc169e200";

// Make fixed token valid for TestUser without getting actual from email
const setValidResetToken = async () => {
  // Hash the fixed test token as you would for a real token
  const hashedTestResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Store the hashed test reset token and a valid expiration time in the database for a TestUser
  const testUser = await User.findOne({ username: "TestUser" });

  testUser.resetPasswordToken = hashedTestResetToken;
  testUser.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  await testUser.save();
};

describe("POST /api/password/forgot", () => {
  it("should send recovery password email", (done) => {
    request(app)
      .post("/api/password/forgot")
      .send({
        email: process.env.USER_TEST_EMAIL,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the success message
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty(
          "message",
          `Email sent to: ${process.env.USER_TEST_EMAIL}`
        );
        done();
      });
  });

  it("should return an error if there is not user with this email in database", (done) => {
    request(app)
      .post("/api/password/forgot")
      .send({
        email: "AAA123@gmail.com",
      })
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 404 });
        expect(res.body).toHaveProperty(
          "message",
          "User not found with this email"
        );
        done();
      });
  });
});

describe("PUT /api/password/reset/:token", () => {
  it("should reset user password", (done) => {
    setValidResetToken();
    request(app)
      .put(`/api/password/reset/${resetToken}`)
      .send({
        email: process.env.USER_TEST_EMAIL,
        password: "sickPassword!",
        confirmPassword: "sickPassword!",
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains a token
        expect(res.body).toHaveProperty("token");

        // Assert that the response contains user
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("username", "TestUser");

        // Assert that the response contains the options for the "user_token" cookie
        expect(res.body).toHaveProperty("options");
        expect(res.body.options).toHaveProperty("expires");
        expect(res.body.options).toHaveProperty("httpOnly", true);
        expect(res.body.options).toHaveProperty("sameSite", "none");
        expect(res.body.options).toHaveProperty("path", "/");
        done();
      });
  });

  it("should return an error if the reset password token is invalid or expired", (done) => {
    request(app)
      .put("/api/password/reset/7372bc1599f6bf2b5e6ab5284a13692dc169e201")
      .send({
        email: "testUser@gmail.com",
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

  it("should return an error if passwords do not match", (done) => {
    setValidResetToken();
    request(app)
      .put(`/api/password/reset/${resetToken}`)
      .send({
        email: process.env.USER_TEST_EMAIL,
        password: "sickPassword!",
        confirmPassword: "sickPassword123!",
      })
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 400 });
        expect(res.body).toHaveProperty("message", "Passwords do not match");
        done();
      });
  });
});
