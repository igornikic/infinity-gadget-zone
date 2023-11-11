import Coupon from "../../models/couponModel.js";

import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

import connectDatabase from "../../config/database.js";

// Setting up config file
dotenv.config({ path: "config/config.env" });

// Variable to store token for seller account
let sellerToken;
// Variable to store coupon id
let couponId;

// Constant that will represent 7d coupon validation
const couponExparationDate = Date.now() + 7 * 24 * 60 * 60 * 1000;

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();

  // Authorize as Test Seller
  const res = await request(app).post("/api/shop/login").send({
    shopEmail: process.env.SELLER_TEST_EMAIL,
    password: "reallygood!",
  });
  sellerToken = res.body.token;
});

// Disconnects from MongoDB database
afterAll(async () => {
  await mongoose.connection.close();
});

describe("POST /api/coupon/new", () => {
  it("should create new coupons", (done) => {
    request(app)
      .post("/api/coupon/new")
      .send({
        name: "Summer discount",
        code: "1234-5678-1234",
        discountType: "amount",
        discountValue: 20,
        numOfCoupons: 2,
        expirationDate: couponExparationDate,
        products: ["64e736e4c8509ba9f32562ee"],
      })
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        // Store coupon id
        couponId = res.body.coupon._id;

        // Assert that the response contains the success message
        expect(res.body).toHaveProperty("success", true);
        // Assert that the response contains coupon's information
        expect(res.body).toHaveProperty("coupon");
        expect(res.body.coupon).toHaveProperty("name", "Summer discount");
        expect(res.body.coupon).toHaveProperty("code", "1234-5678-1234");
        done();
      });
  });

  it("should return error if duplicate code is entered for same shop", (done) => {
    request(app)
      .post("/api/coupon/new")
      .send({
        name: "Summer discount2",
        code: "1234-5678-1234",
        discountType: "percentage",
        discountValue: 20,
        numOfCoupons: 2,
        expirationDate: couponExparationDate,
        products: ["64e736e4c8509ba9f32562ee"],
      })
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 400 });
        expect(res.body).toHaveProperty(
          "message",
          "Duplicate code,shop entered"
        );
        done();
      });
  });

  it("should return error if all products are not found in the shop", (done) => {
    request(app)
      .post("/api/coupon/new")
      .send({
        name: "Summer discount3",
        code: "1234-5678-ABCD",
        discountType: "percentage",
        discountValue: 20,
        numOfCoupons: 3,
        expirationDate: couponExparationDate,
        products: ["64e736e4c8509ba9f32562em"],
      })
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 400 });
        expect(res.body).toHaveProperty(
          "message",
          "Resource not found. Invalid: _id"
        );
        done();
      });
  });

  it("should return error if discount value is greater than product price", (done) => {
    request(app)
      .post("/api/coupon/new")
      .send({
        name: "Summer discount",
        code: "1234-5678-1234",
        discountType: "amount",
        discountValue: 1000,
        numOfCoupons: 2,
        expirationDate: couponExparationDate,
        products: ["64e736e4c8509ba9f32562ee"],
      })
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 400 });
        expect(res.body).toHaveProperty(
          "message",
          "Discount amount cannot be greater than product price"
        );
        done();
      });
  });

  it("should return error if discount type in invalid", (done) => {
    request(app)
      .post("/api/coupon/new")
      .send({
        name: "Summer discount",
        code: "1234-5678-1234",
        discountType: "invalid",
        discountValue: 1000,
        numOfCoupons: 2,
        expirationDate: couponExparationDate,
        products: ["64e736e4c8509ba9f32562ee"],
      })
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 422 });
        expect(res.body).toHaveProperty(
          "message",
          "Coupon validation failed: discountType: Please select correct discount type for this coupon, discountValue: Please enter valid discount value"
        );
        done();
      });
  });
});

describe("GET /api/coupon/:id", () => {
  it("should get shop coupon by id", (done) => {
    request(app)
      .get(`/api/coupon/${couponId}`)
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains success
        expect(res.body).toHaveProperty("success", true);
        // Assert that the response contains coupon's information
        expect(res.body).toHaveProperty("coupon");
        expect(res.body.coupon).toHaveProperty("name", "Summer discount");
        expect(res.body.coupon).toHaveProperty("code", "1234-5678-1234");
        done();
      });
  });

  it("should return error if there is no coupon with this id", (done) => {
    request(app)
      .get(`/api/coupon/64b510cc5c620d7bef933d5f`)
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 404 });
        expect(res.body).toHaveProperty("message", "Coupon not found");
        done();
      });
  });
});

describe("GET /api/coupons", () => {
  it("should get all shop coupons from database", (done) => {
    request(app)
      .get("/api/coupons")
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains success
        expect(res.body).toHaveProperty("success", true);
        // Assert that the response contain coupons
        expect(res.body).toHaveProperty("coupons");
        expect(res.body.count).toBeGreaterThan(0);
        done();
      });
  });
});

describe("DELETE /api/coupon/:id", () => {
  it("should delete coupon from database", (done) => {
    request(app)
      .delete(`/api/coupon/${couponId}`)
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains success
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty(
          "message",
          "Coupon Deleted successfully"
        );
        done();
      });
  });

  it("should return error if there is no coupon with this id", (done) => {
    request(app)
      .delete(`/api/coupon/64b510cc5c620d7bef933d5f`)
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 404 });
        expect(res.body).toHaveProperty(
          "message",
          "Coupon not found with id: 64b510cc5c620d7bef933d5f"
        );
        done();
      });
  });
});
