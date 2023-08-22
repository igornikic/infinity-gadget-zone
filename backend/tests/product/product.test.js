import Product from "../../models/productModel.js";

import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "cloudinary";

import connectDatabase from "../../config/database.js";
import testProduct from "../../__mocks__/test-product.js";
import testProduct2 from "../../__mocks__/test-product2.js";

// Setting up config file
dotenv.config({ path: "backend/config/config.env" });

// Setting up cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Variable to store token for seller account
let sellerToken;

// Array to store public IDs of uploaded product images
let uploadedProductPublicIds = [];

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
  // Delete test products from database after all tests
  const productNames = ["Shoe", "Shoe2"];
  await Product.deleteMany({ name: { $in: productNames } });

  // Delete all product images from cloudinary after all tests
  uploadedProductPublicIds.forEach(async (publicId) => {
    await cloudinary.uploader.destroy(publicId);
  });

  // Disconnects from MongoDB database
  await mongoose.connection.close();
});

describe("POST /api/product/new", () => {
  it("should create new product with one image", (done) => {
    request(app)
      .post("/api/product/new")
      .send({
        name: "Shoe",
        price: 99.99,
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        ratings: 0,
        category: "Sports & Outdoors",
        shop: "64d194ec5fb1cfaede33629b",
        stock: 1,
        numOfReviews: 0,
        reviews: [],
        coupons: [],
        images: [testProduct],
      })
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        const publicId = res.body.product.images.map(
          (image) => image.public_id
        );
        uploadedProductPublicIds.push(...publicId);

        // Assert that the response contains the success message
        expect(res.body).toHaveProperty("success", true);
        // Assert that the response contains product's information
        expect(res.body).toHaveProperty("product");
        expect(res.body.product).toHaveProperty("name", "Shoe");
        expect(res.body.product).toHaveProperty("price", 99.99);
        done();
      });
  });

  it("should create new product with multiple images", (done) => {
    request(app)
      .post("/api/product/new")
      .send({
        name: "Shoe2",
        price: 89.99,
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        ratings: 0,
        category: "Sports & Outdoors",
        shop: "64d194ec5fb1cfaede33629b",
        stock: 1,
        numOfReviews: 0,
        reviews: [],
        coupons: [],
        images: [testProduct, testProduct2],
      })
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        const publicId = res.body.product.images.map(
          (image) => image.public_id
        );
        uploadedProductPublicIds.push(...publicId);

        // Assert that the response contains the success message
        expect(res.body).toHaveProperty("success", true);
        // Assert that the response contains product's information
        expect(res.body).toHaveProperty("product");
        expect(res.body.product).toHaveProperty("name", "Shoe2");
        expect(res.body.product).toHaveProperty("price", 89.99);
        done();
      });
  });

  it("should return an error if shop is not found", (done) => {
    request(app)
      .post("/api/product/new")
      .send({
        name: "Laptop",
        price: 999.99,
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        ratings: 0,
        category: "Electronics",
        shop: "64d194ec5fb1cfaede33629c",
        stock: 1,
        numOfReviews: 0,
        reviews: [],
        coupons: [],
        images: [testProduct],
      })
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);
        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", {
          statusCode: 404,
        });
        expect(res.body).toHaveProperty("message", "Shop not found");
        done();
      });
  });

  it("should return an error if required fields are empty", (done) => {
    request(app)
      .post("/api/product/new")
      .send({
        name: "",
        price: 999.99,
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        ratings: 0,
        category: "Electronics",
        shop: "64d194ec5fb1cfaede33629b",
        stock: 1,
        numOfReviews: 0,
        reviews: [],
        coupons: [],
        images: [testProduct],
      })
      .set("Accept", "application/json")
      .set("Cookie", [`shop_token=${sellerToken}`])
      .expect("Content-Type", /json/)
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", {
          statusCode: 422,
        });
        expect(res.body).toHaveProperty(
          "message",
          "Product validation failed: name: Please enter product name"
        );
        done();
      });
  });
});
