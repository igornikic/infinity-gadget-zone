import Product from "../../models/productModel.js";

import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "cloudinary";

import testProduct from "../../__mocks__/test-product.js";
import connectDatabase from "../../config/database.js";

// Setting up config file
dotenv.config({ path: "config/config.env" });

// Setting up cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Variable to store admin token
let adminToken;
// Variable to store seller token
let sellerToken;
// Variable to store id for product that tests delete route
let productId;

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();

  // Authorize as Admin
  const loginRes = await request(app).post("/api/login").send({
    email: process.env.ADMIN_TEST_EMAIL,
    password: "sickPassword!",
  });
  adminToken = loginRes.body.token;
});

// Disconnects from MongoDB database
afterAll(async () => {
  await mongoose.connection.close();
});

const productForDelete = async (shopId) => {
  // Upload product image to Cloudinary
  const result = await cloudinary.uploader.upload(testProduct, {
    folder: "IGZproducts",
    width: 150,
    crop: "scale",
  });

  // Create product for delete test
  const insertProductRes = await Product.create({
    name: "Shoe3",
    price: 999.99,
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    ratings: 4,
    category: "Sports & Outdoors",
    shop: shopId,
    stock: 1,
    numOfReviews: 1,
    reviews: [
      {
        user: "64790344758eda847fa6895f",
        username: "TestUser",
        rating: 4,
        comment: "Nice!",
      },
    ],
    coupons: [],
    images: [
      {
        public_id: result.public_id,
        url: result.secure_url,
      },
    ],
  });
  productId = insertProductRes._id;
};

describe("DELETE /api/shop/product/:id", () => {
  it("should delete product from database", async () => {
    try {
      await productForDelete("64d194ec5fb1cfaede33629b");

      // Authorize as Seller
      const loginRes = await request(app).post("/api/shop/login").send({
        shopEmail: process.env.SELLER_TEST_EMAIL,
        password: "reallygood!",
      });
      sellerToken = loginRes.body.token;

      const deleteRes = await request(app)
        .delete(`/api/shop/product/${productId}`)
        .set("Accept", "application/json")
        .set("Cookie", [`shop_token=${sellerToken}`])
        .expect("Content-Type", /json/)
        .expect(200);

      // Assert that the response contains success
      expect(deleteRes.body).toHaveProperty("success", true);
      expect(deleteRes.body).toHaveProperty(
        "message",
        "Product Deleted successfully"
      );
    } catch (error) {
      throw error;
    }
  });

  it("should return error if there is no product with this id", (done) => {
    request(app)
      .delete(`/api/shop/product/64b510cc5c620d7bef933d5f`)
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
          "Product not found with id: 64b510cc5c620d7bef933d5f"
        );

        done();
      });
  });

  it("should return error if you are not authorized to delete this product", async () => {
    try {
      await productForDelete("64d194ec5fb1cfaede33629c");

      const deleteRes = await request(app)
        .delete(`/api/shop/product/${productId}`)
        .set("Accept", "application/json")
        .set("Cookie", [`shop_token=${sellerToken}`])
        .expect("Content-Type", /json/)
        .expect(403);

      // Assert that the response contains the error message
      expect(deleteRes.body).toHaveProperty("success", false);
      expect(deleteRes.body).toHaveProperty("error", { statusCode: 403 });
      expect(deleteRes.body).toHaveProperty(
        "message",
        "You are not authorized to delete this product"
      );
    } catch (error) {
      throw error;
    }
  });
});

describe("DELETE /api/reviews?productId=&id=", () => {
  it("should delete product review if admin is making request", (done) => {
    request(app)
      .delete(`/api/reviews?productId=${productId}&id=64790344758eda847fa6895f`)
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
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
});

describe("DELETE /api/admin/product/:id", () => {
  it("should delete product from database", (done) => {
    request(app)
      .delete(`/api/admin/product/${productId}`)
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        // Assert that the response contains success
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty(
          "message",
          "Product Deleted successfully"
        );
        done();
      });
  });

  it("should return error if there is no product with this id", (done) => {
    request(app)
      .delete(`/api/admin/product/64b510cc5c620d7bef933d5f`)
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
          "Product not found with id: 64b510cc5c620d7bef933d5f"
        );

        done();
      });
  });
});

describe("GET /api/admin/products", () => {
  it("should get all products from database", (done) => {
    request(app)
      .get("/api/admin/products")
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains products
        expect(res.body).toHaveProperty("products");

        done();
      });
  });
});
