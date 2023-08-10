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

// Variable to store user token for admin account
let adminToken;
// Variable to store avatar url retrieved from cloudinary
let avatarUrl;
// Variable to store id
let id;

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();
  // Authorize as Admin
  const res = await request(app).post("/api/login").send({
    email: process.env.ADMIN_TEST_EMAIL,
    password: "sickPassword!",
  });
  id = res.body.user._id;
  adminToken = res.body.token;
  avatarUrl = res.body.user.avatar.url;
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
