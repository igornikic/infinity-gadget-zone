import Product from "../../models/productModel.js";

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

// Variable to store token for user account
let userToken;

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();

  // Authorize as Test Admin
  const res = await request(app).post("/api/login").send({
    email: process.env.USER_TEST_EMAIL,
    password: "sickPassword!",
  });
  userToken = res.body.token;
});

// Disconnects from MongoDB database
afterAll(async () => {
  await mongoose.connection.close();
});

describe("POST /api/review", () => {
  it("should create new product review", (done) => {
    request(app)
      .put("/api/review")
      .send({
        rating: 4,
        comment: "Nice!",
        productId: "64e736e4c8509ba9f32562ee",
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the success message
        expect(res.body).toHaveProperty("success", true);
        done();
      });
  });

  it("should update product review", (done) => {
    request(app)
      .put("/api/review")
      .send({
        rating: 5,
        comment: "Super!",
        productId: "64e736e4c8509ba9f32562ee",
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the success message
        expect(res.body).toHaveProperty("success", true);
        done();
      });
  });

  it("should return error if there is no product with this id", (done) => {
    request(app)
      .put("/api/review")
      .send({
        rating: 5,
        comment: "Super!",
        productId: "64e736e4c8509ba9f32562ed",
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 404 });
        expect(res.body).toHaveProperty(
          "message",
          "Product not found with id: 64e736e4c8509ba9f32562ed"
        );
        done();
      });
  });
});

describe("DELETE /api/reviews?productId=&id=", () => {
  it("should delete user's review", (done) => {
    request(app)
      .delete(
        "/api/reviews?productId=64e736e4c8509ba9f32562ee&id=64790344758eda847fa6895f"
      )
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the success message
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty(
          "message",
          "Review Deleted successfully"
        );
        done();
      });
  });

  it("should return error if there is no review with this id", (done) => {
    request(app)
      .delete(
        "/api/reviews?productId=64e736e4c8509ba9f32562ee&id=64b7eca4ba043a499902bd8f"
      )
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 404 });
        expect(res.body).toHaveProperty("message", "Review not found");
        done();
      });
  });
});

describe("GET /api/reviews?id=", () => {
  it("should get all product reviews", (done) => {
    request(app)
      .get("/api/reviews?id=64e736e4c8509ba9f32562ee")
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the success message
        expect(res.body).toHaveProperty("success", true);
        // Assert that the response contains reviews
        expect(res.body).toHaveProperty("reviews");
        done();
      });
  });

  it("should return error if there is no product with this id", (done) => {
    request(app)
      .get("/api/reviews?id=64e736e4c8509ba9f32562ed")
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 404 });
        expect(res.body).toHaveProperty("message", "Product not found");
        done();
      });
  });
});
