import Order from "../../models/orderModel.js";

import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

import connectDatabase from "../../config/database.js";

// Setting up config file
dotenv.config({ path: "backend/config/config.env" });

// Variable to store token for user account
let userToken;
// Variable to store token for seller account
let sellerToken;

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();

  // Authorize as Test User
  const res = await request(app).post("/api/login").send({
    email: process.env.USER_TEST_EMAIL,
    password: "sickPassword!",
  });
  userToken = res.body.token;

  // Update test order status to Processing
  await Order.findByIdAndUpdate(
    "64f6475ee7dd47eb7b39d208",
    { orderStatus: "Processing" },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
});

// Disconnects from MongoDB database
afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET /api/order/:id", () => {
  it("should get order details", (done) => {
    request(app)
      .get(`/api/order/64f6475ee7dd47eb7b39d208`)
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains order
        expect(res.body).toHaveProperty("order");

        done();
      });
  });

  it("should return error if there is no order with this id", (done) => {
    request(app)
      .get(`/api/order/640918348eb4dc67ab9c3373`)
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 404 });
        expect(res.body).toHaveProperty("message", "Order not found");

        done();
      });
  });
});

describe("GET /api/orders/me", () => {
  it("should get user orders", (done) => {
    request(app)
      .get("/api/orders/me")
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains orders
        expect(res.body).toHaveProperty("orders");

        done();
      });
  });
});

describe("GET /api/orders/shop", () => {
  it("should get shop orders", async () => {
    try {
      // Authenticate as seller
      const loginRes = await request(app)
        .post("/api/shop/login")
        .send({
          shopEmail: process.env.SELLER_TEST_EMAIL,
          password: "reallygood!",
        })
        .expect(200);
      sellerToken = loginRes.body.token;

      // Get order details
      const orderRes = await request(app)
        .get("/api/orders/shop")
        .set("Accept", "application/json")
        .set("Cookie", [`shop_token=${sellerToken}`])
        .expect("Content-Type", /json/)
        .expect(200);

      // Assert that the response contains shop orders
      expect(orderRes.body).toHaveProperty("orders");
    } catch (error) {
      throw error;
    }
  });
});

describe("PUT /api/order/:id", () => {
  it("should update order status to shipped", (done) => {
    request(app)
      .put("/api/order/64f6475ee7dd47eb7b39d208")
      .send({
        orderStatus: "Shipped",
      })
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains order
        expect(res.body).toHaveProperty("order");
        expect(res.body.order).toHaveProperty("orderStatus", "Shipped");

        done();
      });
  });

  it("should return error if there is no order with this id", (done) => {
    request(app)
      .put(`/api/order/640918348eb4dc67ab9c3373`)
      .send({ orderStatus: "Shipped" })
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
          "Order not found with this id"
        );

        done();
      });
  });

  it("should update order status to delivered", (done) => {
    request(app)
      .put("/api/order/64f6475ee7dd47eb7b39d208")
      .send({
        orderStatus: "Delivered",
      })
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains order
        expect(res.body).toHaveProperty("order");
        expect(res.body.order).toHaveProperty("orderStatus", "Delivered");

        done();
      });
  });

  it("should return error if order is already delivered", (done) => {
    request(app)
      .put(`/api/order/64f6475ee7dd47eb7b39d208`)
      .send({ orederStatus: "Shipped" })
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 400 });
        expect(res.body).toHaveProperty("message", "Order already delivered");

        done();
      });
  });
});
