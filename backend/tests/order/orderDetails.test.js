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

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();

  // Authorize as Test User
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
