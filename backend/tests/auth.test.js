import User from "../models/userModel.js";

import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "cloudinary";

import connectDatabase from "../config/database.js";
import testAvatar from "../__mocks__/test-avatar.js";

// Setting up config file
dotenv.config({ path: "backend/config/config.env" });

// Setting up cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();
});

// Array to store public IDs of uploaded avatars
let uploadedAvatarPublicIds = [];

afterAll(async () => {
  // Delete test users from database after all tests
  const emails = ["testUser@gmail.com", "testUser3@gmail.com"];
  await User.deleteMany({ email: { $in: emails } });

  // Delete all avatars from cloudinary after all tests
  uploadedAvatarPublicIds.forEach(async (publicId) => {
    await cloudinary.uploader.destroy(publicId);
  });

  // Disconnects from MongoDB database
  await mongoose.connection.close();
});

describe("POST /api/register", function () {
  it("should register a new user and return a token", function (done) {
    request(app)
      .post("/api/register")
      .send({
        username: "testUser",
        firstName: "John",
        lastName: "Doe",
        email: "testUser@gmail.com",
        password: "password123",
        confirmPassword: "password123",
        avatar: testAvatar,
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err);

        const publicId = res.body.user.avatar.public_id;
        uploadedAvatarPublicIds.push(publicId);

        // Assert that the response contains a token
        expect(res.body).toHaveProperty("token");

        // Assert that the response contains the registered user's information
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("username", "testUser");
        expect(res.body.user).toHaveProperty("firstName", "John");
        expect(res.body.user).toHaveProperty("lastName", "Doe");
        expect(res.body.user).toHaveProperty("email", "testUser@gmail.com");
        expect(res.body.user).toHaveProperty("role", "user");

        // Assert that the response contains the options for the "user_token" cookie
        expect(res.body).toHaveProperty("options");
        expect(res.body.options).toHaveProperty("expires");
        expect(res.body.options).toHaveProperty("httpOnly", true);
        expect(res.body.options).toHaveProperty("sameSite", "none");
        expect(res.body.options).toHaveProperty("path", "/");

        done();
      });
  });

  it("should return an error if passwords do not match", function (done) {
    request(app)
      .post("/api/register")
      .send({
        username: "testUser2",
        firstName: "John2",
        lastName: "Doe2",
        email: "testUser2@gmail.com",
        password: "password123",
        confirmPassword: "password456", // Different password for confirmation
        avatar: testAvatar,
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 400 });
        expect(res.body).toHaveProperty("message", "Password does not match");
        done();
      });
  });

  it("should return an error if the username is already taken", function (done) {
    // Create a mock user
    const mockUser = {
      username: "testUser3",
      firstName: "John3",
      lastName: "Doe3",
      email: "testUser3@gmail.com",
      password: "password123",
      confirmPassword: "password123",
      avatar: testAvatar,
    };

    // Register the mock user
    request(app)
      .post("/api/register")
      .send(mockUser)
      .set("Accept", "application/json")
      .end(function (err, res) {
        if (err) return done(err);

        const publicId = res.body.user.avatar.public_id;
        uploadedAvatarPublicIds.push(publicId);

        // Attempt to register the same user again to simulate a duplicate key error
        request(app)
          .post("/api/register")
          .send(mockUser)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(409)
          .end(function (err, res) {
            if (err) return done(err);

            // Assert that the response contains the error message
            expect(res.body).toHaveProperty("success", false);
            expect(res.body).toHaveProperty("error", {
              statusCode: 409,
            });
            expect(res.body).toHaveProperty(
              "message",
              "Username already taken"
            );

            done();
          });
        done();
      });
  });

  it("should return an error if email is already taken", function (done) {
    request(app)
      .post("/api/register")
      .send({
        username: "testUser4",
        firstName: "John4",
        lastName: "Doe4",
        email: "testUser3@gmail.com",
        password: "password123",
        confirmPassword: "password123",
        avatar: testAvatar,
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(409)
      .end(function (err, res) {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", {
          statusCode: 409,
        });
        expect(res.body).toHaveProperty("message", "Email already taken");

        done();
      });
  });

  it("should return an error if required fields are empty", function (done) {
    request(app)
      .post("/api/register")
      .send({
        username: "",
        firstName: "John5",
        lastName: "Doe5",
        email: "testUser5@gmail.com",
        password: "password123",
        confirmPassword: "password123",
        avatar: testAvatar,
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", {
          statusCode: 400,
        });
        expect(res.body).toHaveProperty(
          "message",
          "ValidationError: username: Please enter your username"
        );

        done();
      });
  });

  it("should return an error if username is not at least 3 characters long", function (done) {
    request(app)
      .post("/api/register")
      .send({
        username: "a1",
        firstName: "John6",
        lastName: "Doe6",
        email: "testUser6@gmail.com",
        password: "password123",
        confirmPassword: "password123",
        avatar: testAvatar,
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", {
          statusCode: 400,
        });
        expect(res.body).toHaveProperty(
          "message",
          "ValidationError: username: Your username must be at least 3 characters long"
        );
        done();
      });
  });
});
