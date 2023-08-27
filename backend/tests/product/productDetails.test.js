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

// Function for expiring product view
const expireView = async () => {
  const product = await Product.findById("64e736e4c8509ba9f32562ee");

  const expirationTime = Date.now() - 7 * 24 * 60 * 60 * 1000;

  product.views.forEach((view) => {
    view.viewedAt = expirationTime;
  });

  await product.save();
};

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();
});

// Disconnects from MongoDB database
afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET /api/product/:id", () => {
  it("should get product details even when not logged in", (done) => {
    request(app)
      .get(`/api/product/64e736e4c8509ba9f32562ee`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains product
        expect(res.body).toHaveProperty("product");
        expect(res.body.product).toHaveProperty("name", "Test Product");

        done();
      });
  });

  it("should get product details when logged as user", async () => {
    try {
      // Authenticate as user
      const loginRes = await request(app)
        .post("/api/login")
        .send({
          email: process.env.USER_TEST_EMAIL,
          password: "sickPassword!",
        })
        .expect(200);
      const userToken = loginRes.body.token;

      // Get product details
      const productRes = await request(app)
        .get(`/api/product/64e736e4c8509ba9f32562ee`)
        .set("Accept", "application/json")
        .set("Cookie", [`user_token=${userToken}`])
        .expect("Content-Type", /json/)
        .expect(200);

      // Assert that the response contains product
      expect(productRes.body).toHaveProperty("product");
      expect(productRes.body.product).toHaveProperty("name", "Test Product");

      await expireView();
      // Logout
      await request(app).get("/api/logout").expect(200);
    } catch (error) {
      throw error;
    }
  });

  it("should get product details when logged as seller", async () => {
    try {
      await expireView();

      // Authenticate as seller
      const loginRes = await request(app)
        .post("/api/shop/login")
        .send({
          shopEmail: process.env.SELLER_TEST_EMAIL,
          password: "reallygood!",
        })
        .expect(200);
      const sellerToken = loginRes.body.token;

      // Get product details
      const productRes = await request(app)
        .get(`/api/product/64e736e4c8509ba9f32562ee`)
        .set("Accept", "application/json")
        .set("Cookie", [`shop_token=${sellerToken}`])
        .expect("Content-Type", /json/)
        .expect(200);

      // Get product details
      await request(app)
        .get(`/api/product/64e736e4c8509ba9f32562ee`)
        .set("Accept", "application/json")
        .set("Cookie", [`shop_token=${sellerToken}`])
        .expect("Content-Type", /json/)
        .expect(200);

      // Assert that the response contains product
      expect(productRes.body).toHaveProperty("product");
      expect(productRes.body.product).toHaveProperty("name", "Test Product");

      // Logout
      await request(app).get("/api/shop/logout").expect(200);
    } catch (error) {
      throw error;
    }
  });

  it("should get return error if there is not product with this id", (done) => {
    request(app)
      .get(`/api/product/640918348eb4dc67ab9c3373`)
      .set("Accept", "application/json")
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
