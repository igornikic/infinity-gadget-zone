import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "cloudinary";

import connectDatabase from "../../config/database.js";
import testLogo from "../../__mocks__/test-logo.js";

// Setting up config file
dotenv.config({ path: "backend/config/config.env" });

// Setting up cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Variable to store seller token for seller account
let sellerToken;
// Variable to store logo url retrieved from cloudinary
let logoUrl;
// Variable to store id
let id;

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();

  // Authorize as Test seller
  const res = await request(app).post("/api/shop/login").send({
    shopEmail: "testShop4@gmail.com",
    password: "123456789",
  });
  id = res.body.shop._id;
  sellerToken = res.body.token;
  logoUrl = res.body.shop.logo.url;
});

// Disconnects from MongoDB database
afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET /api/shop/me", () => {
  it("should get seller shop", (done) => {
    request(app)
      .get("/api/shop/me")
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains shop
        expect(res.body).toHaveProperty("shop");
        expect(res.body.shop).toHaveProperty("shopName", "Test Shop4");

        done();
      });
  });

  it("should return error if you are not authenticated as seller", (done) => {
    request(app)
      .get("/api/shop/me")
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=""`])
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty(
          "message",
          "Login first to access this resource"
        );
        done();
      });
  });
});

describe("PUT /api/shop/me/update", () => {
  it("should update shop data without uploading logo because it haven't changed", (done) => {
    request(app)
      .put("/api/shop/me/update")
      .send({
        shopName: "Test Shop5",
        shopEmail: "testShop5@gmail.com",
        phoneNumber: 123456788,
        address: "1234 Avenija 67",
        zipCode: 3222,
        logo: logoUrl,
      })
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains shop
        expect(res.body).toHaveProperty("shop");
        expect(res.body.shop).toHaveProperty("shopName", "Test Shop5");
        expect(res.body.shop).toHaveProperty(
          "shopEmail",
          "testShop5@gmail.com"
        );
        expect(res.body.shop).toHaveProperty("phoneNumber", 123456788);
        expect(res.body.shop).toHaveProperty("address", "1234 Avenija 67");
        expect(res.body.shop).toHaveProperty("zipCode", 3222);

        done();
      });
  });

  it("should update shop data and upload new logo", (done) => {
    request(app)
      .put("/api/shop/me/update")
      .send({
        shopName: "Test Shop4",
        shopEmail: "testShop4@gmail.com",
        phoneNumber: 123456789,
        address: "123 Avenija 67",
        zipCode: 3456,
        logo: testLogo,
      })
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains shop
        expect(res.body).toHaveProperty("shop");
        expect(res.body.shop).toHaveProperty("shopName", "Test Shop4");
        expect(res.body.shop).toHaveProperty(
          "shopEmail",
          "testShop4@gmail.com"
        );
        expect(res.body.shop).toHaveProperty("phoneNumber", 123456789);
        expect(res.body.shop).toHaveProperty("address", "123 Avenija 67");
        expect(res.body.shop).toHaveProperty("zipCode", 3456);

        done();
      });
  });

  it("should return error if data is invalid", (done) => {
    request(app)
      .put("/api/shop/me/update")
      .send({
        shopName: "",
        shopEmail: "testShop@gmail.com",
        phoneNumber: 123456789,
        address: "123 Avenija 67",
        zipCode: 3456,
        logo: testLogo,
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
          "Validation failed: shopName: Please enter shop name"
        );

        done();
      });
  });
});

describe("GET /api/shop/info/:id", () => {
  it("should get shop by id", (done) => {
    request(app)
      .get(`/api/shop/info/${id}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains shop
        expect(res.body).toHaveProperty("shop");
        expect(res.body.shop).toHaveProperty("shopName", "Test Shop4");

        done();
      });
  });

  it("should return error if there is no shop with this id", (done) => {
    request(app)
      .get(`/api/shop/info/64b510cc5c620d7bef933d5f`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 404 });
        expect(res.body).toHaveProperty(
          "message",
          "Shop not found with id: 64b510cc5c620d7bef933d5f"
        );

        done();
      });
  });

  it("should return error if id is invalid", (done) => {
    request(app)
      .get(`/api/shop/info/64b510`)
      .set("Accept", "application/json")
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
});
