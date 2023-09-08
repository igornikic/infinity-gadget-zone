import Coupon from "../../models/couponModel.js";

import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

import connectDatabase from "../../config/database.js";

// Setting up config file
dotenv.config({ path: "backend/config/config.env" });

// Constant that will represent 7d coupon validation
const couponExparationDate = Date.now() + 7 * 24 * 60 * 60 * 1000;
// Variable to store token for user account
let userToken;
// Variables to store inserted coupons
let insertedCoupon1;
let insertedCoupon2;

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();

  // Authorize as Test User
  const res = await request(app).post("/api/login").send({
    email: process.env.USER_TEST_EMAIL,
    password: "sickPassword!",
  });
  userToken = res.body.token;

  // Insert coupons for tests
  insertedCoupon1 = await Coupon.create({
    name: "Winter Discount",
    code: "1234-1234-1234",
    discountType: "amount",
    discountValue: 20,
    numOfCoupons: 4,
    expirationDate: couponExparationDate,
    products: ["64e736e4c8509ba9f32562ee"],
    shop: "64d194ec5fb1cfaede33629b",
  });

  insertedCoupon2 = await Coupon.create({
    name: "Super Discount",
    code: "0123-0123-0123",
    discountType: "percentage",
    discountValue: 10,
    numOfCoupons: 1,
    expirationDate: couponExparationDate,
    products: ["64e736e4c8509ba9f32562ee"],
    shop: "64d194ec5fb1cfaede33629b",
  });
});

// Disconnects from MongoDB database
afterAll(async () => {
  // Delete test coupons
  await Coupon.deleteOne({ _id: insertedCoupon1._id });
  await Coupon.deleteOne({ _id: insertedCoupon2._id });

  await mongoose.connection.close();
});

describe("POST /api/orer/new", () => {
  it("should create new order without discount coupon", (done) => {
    request(app)
      .post("/api/order/new")
      .send({
        orderItems: [
          {
            name: "Test Product",
            price: 1000,
            quantity: 3,
            image:
              "https://res.cloudinary.com/dsqjoidmi/image/upload/v1692717898/IGZproducts/jsrq44qukmsisldpzu9a.jpg",
            product: "64e736e4c8509ba9f32562ee",
          },
          {
            name: "SomethingElse34",
            price: 22.99,
            quantity: 1,
            image:
              "https://res.cloudinary.com/dsqjoidmi/image/upload/v1693248321/IGZproducts/qfvlzzxlkwi6d5gq4am1.png",
            product: "64eceb42ea4a92dcd7c05c59",
          },
          {
            name: "Test Product",
            price: 1000,
            quantity: 1,
            image:
              "https://res.cloudinary.com/dsqjoidmi/image/upload/v1692717898/IGZproducts/jsrq44qukmsisldpzu9a.jpg",
            product: "64e736e4c8509ba9f32562ee",
          },
        ],
        shippingInfo: {
          address: "Savski venac 8",
          city: "Zajecar",
          phoneNo: "06969",
          postalCode: "10091",
          country: "Serbia",
        },
        paymentInfo: {
          id: "34256rf",
          status: "succeeded",
        },
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the success message
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("userOrder");
        done();
      });
  });

  it("should create new order with discount coupon applied on all products", (done) => {
    request(app)
      .post("/api/order/new")
      .send({
        orderItems: [
          {
            name: "Test Product",
            price: 1000,
            quantity: 3,
            image:
              "https://res.cloudinary.com/dsqjoidmi/image/upload/v1692717898/IGZproducts/jsrq44qukmsisldpzu9a.jpg",
            product: "64e736e4c8509ba9f32562ee",
            couponCode: "1234-1234-1234",
          },
        ],
        shippingInfo: {
          address: "Savski venac 8",
          city: "Zajecar",
          phoneNo: "06969",
          postalCode: "10091",
          country: "Serbia",
        },
        paymentInfo: {
          id: "34256rf",
          status: "succeeded",
        },
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the success message
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("userOrder");
        done();
      });
  });

  it("should create new order with discount coupon applied on 1 product", (done) => {
    request(app)
      .post("/api/order/new")
      .send({
        orderItems: [
          {
            name: "Test Product",
            price: 1000,
            quantity: 3,
            image:
              "https://res.cloudinary.com/dsqjoidmi/image/upload/v1692717898/IGZproducts/jsrq44qukmsisldpzu9a.jpg",
            product: "64e736e4c8509ba9f32562ee",
            couponCode: "0123-0123-0123",
          },
        ],
        shippingInfo: {
          address: "Savski venac 8",
          city: "Zajecar",
          phoneNo: "06969",
          postalCode: "10091",
          country: "Serbia",
        },
        paymentInfo: {
          id: "34256rf",
          status: "succeeded",
        },
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the success message
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("userOrder");
        done();
      });
  });

  it("should return error if coupon is invalid", (done) => {
    request(app)
      .post("/api/order/new")
      .send({
        orderItems: [
          {
            name: "Test Product",
            price: 1000,
            quantity: 3,
            image:
              "https://res.cloudinary.com/dsqjoidmi/image/upload/v1692717898/IGZproducts/jsrq44qukmsisldpzu9a.jpg",
            product: "64e736e4c8509ba9f32562ee",
            couponCode: "1234-5678-0000",
          },
        ],
        shippingInfo: {
          address: "Savski venac 8",
          city: "Zajecar",
          phoneNo: "06969",
          postalCode: "10091",
          country: "Serbia",
        },
        paymentInfo: {
          id: "34256rf",
          status: "succeeded",
        },
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 400 });
        expect(res.body).toHaveProperty(
          "message",
          "Coupon is invalid or has expired"
        );
        done();
      });
  });

  it("should return error if product is not found", (done) => {
    request(app)
      .post("/api/order/new")
      .send({
        orderItems: [
          {
            name: "Test Product",
            price: 1000,
            quantity: 1,
            image:
              "https://res.cloudinary.com/dsqjoidmi/image/upload/v1692717898/IGZproducts/jsrq44qukmsisldpzu9a.jpg",
            product: "64e736e4c8509ba9f32562ef",
          },
        ],
        shippingInfo: {
          address: "Savski venac 8",
          city: "Zajecar",
          phoneNo: "06969",
          postalCode: "10091",
          country: "Serbia",
        },
        paymentInfo: {
          id: "34256rf",
          status: "succeeded",
        },
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
        expect(res.body).toHaveProperty("message", "Product not found");
        done();
      });
  });
});
