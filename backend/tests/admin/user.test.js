import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "cloudinary";

import testAvatar2 from "../../__mocks__/test-avatar2.js";
import connectDatabase from "../../config/database.js";

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
// Variable to store avatar url retrieved from cloudinary
let avatarUrl;
// Variable to store id
let id;
// Variable to store id for account that tests delete route
let mockUserId;

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();
  // Authorize as Test
  const res = await request(app).post("/api/login").send({
    email: process.env.ADMIN_TEST_EMAIL,
    password: "sickPassword!",
  });
  id = res.body.user._id;
  adminToken = res.body.token;
  avatarUrl = res.body.user.avatar.url;

  // Create account for delete test and store id
  const mockUserRes = await request(app).post("/api/register").send({
    username: "testUser7",
    firstName: "John7",
    lastName: "Doe7",
    email: "testUser7@gmail.com",
    password: "password123",
    confirmPassword: "password123",
    avatar: testAvatar2,
  });
  mockUserId = mockUserRes.body.user._id;
});

// Disconnects from MongoDB database
afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET /api/admin/users", () => {
  it("should get all users from database", (done) => {
    request(app)
      .get("/api/admin/users")
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains users
        expect(res.body).toHaveProperty("users");

        done();
      });
  });
});

describe("GET /api/admin/user/:id", () => {
  it("should get user details", (done) => {
    request(app)
      .get(`/api/admin/user/${id}`)
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains user
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("username", "TestAdmin");

        done();
      });
  });

  it("should return error if there is no user with this id", (done) => {
    request(app)
      .get(`/api/admin/user/64b510cc5c620d7bef933d5f`)
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
          "User not found with id: 64b510cc5c620d7bef933d5f"
        );

        done();
      });
  });
});

describe("PUT /api/admin/user/:id", () => {
  it("should update user details", (done) => {
    request(app)
      .put(`/api/admin/user/${id}`)
      .send({
        username: "TestAdmin",
        email: process.env.ADMIN_TEST_EMAIL,
        role: "admin",
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains user
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("username", "TestAdmin");
        expect(res.body.user).toHaveProperty(
          "email",
          process.env.ADMIN_TEST_EMAIL
        );
        expect(res.body.user).toHaveProperty("role", "admin");

        done();
      });
  });

  it("should return error if there is no user with this id", (done) => {
    request(app)
      .put(`/api/admin/user/64b510cc5c620d7bef933d5f`)
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
          "User not found with id: 64b510cc5c620d7bef933d5f"
        );

        done();
      });
  });
});

describe("DELETE /api/admin/user/:id", () => {
  it("should delete account from database", (done) => {
    request(app)
      .delete(`/api/admin/user/${mockUserId}`)
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

  it("should return error if there is no user with this id", (done) => {
    request(app)
      .delete(`/api/admin/user/64b510cc5c620d7bef933d5f`)
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
          "User not found with id: 64b510cc5c620d7bef933d5f"
        );

        done();
      });
  });
});
