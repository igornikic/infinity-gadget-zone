import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

import connectDatabase from "../config/database.js";

// Setting up config file
dotenv.config({ path: "backend/config/config.env" });

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();
});

afterAll(async () => {
  // Disconnects from MongoDB database
  await mongoose.connection.close();
});

describe("POST /api/password/forgot", () => {
  it("should send recovery password email", (done) => {
    request(app)
      .post("/api/password/forgot")
      .send({
        email: "igornikic001@gmail.com",
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty(
          "message",
          "Email sent to: igornikic001@gmail.com"
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
