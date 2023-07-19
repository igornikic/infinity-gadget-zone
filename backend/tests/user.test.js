import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

import connectDatabase from "../config/database.js";

// Setting up config file
dotenv.config({ path: "backend/config/config.env" });

// Variable to store the user token
let userToken;

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();
  // Authorize as TestUser
  const res = await request(app).post("/api/login").send({
    email: "igornikic001@gmail.com",
    password: "sickPassword!",
  });
  userToken = res.body.token;
});

// Disconnects from MongoDB database
afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET /api/me", () => {
  it("should get user profile", (done) => {
    request(app)
      .get("/api/me")
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains user
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("username", "TestUser");

        done();
      });
  });
});
