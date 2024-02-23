import Order from "../../models/orderModel.js";
import Coupon from "../../models/couponModel.js";

import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

import connectDatabase from "../../config/database.js";

// Setting up config file
dotenv.config({ path: "config/config.env" });

// Constant that will represent 7d coupon validation
const couponExparationDate = Date.now() + 7 * 24 * 60 * 60 * 1000;
// Variable to store token for user account
let userToken;
// Variable to store token for seller account
let sellerToken;
// Variables to store inserted coupons and order id
let insertedCoupon1;
let insertedCoupon2;
let orderId;

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
    products: ["658dad0fac4c8d58272469ea"],
    shopId: "64d194ec5fb1cfaede33629b",
  });

  insertedCoupon2 = await Coupon.create({
    name: "Super Discount",
    code: "0123-0123-0123",
    discountType: "percentage",
    discountValue: 10,
    numOfCoupons: 1,
    expirationDate: couponExparationDate,
    products: ["658dad0fac4c8d58272469ea"],
    shopId: "64d194ec5fb1cfaede33629b",
  });
});

// Disconnects from MongoDB database
afterAll(async () => {
  // Delete test coupons
  await Coupon.deleteOne({ _id: insertedCoupon1._id });
  await Coupon.deleteOne({ _id: insertedCoupon2._id });
  // Delete orders made by test user but exclude order that we need for other tests
  await Order.deleteMany({
    user: "64790344758eda847fa6895f",
    _id: { $ne: "64f6475ee7dd47eb7b39d208" },
  });

  await mongoose.connection.close();
});

describe("POST /api/order/new", () => {
  it("should create new order without discount coupon", (done) => {
    request(app)
      .post("/api/order/new")
      .send({
        orderItems: [
          {
            name: "Test Product 1",
            price: 22.99,
            quantity: 3,
            image:
              "https://res.cloudinary.com/dsqjoidmi/image/upload/v1703783693/IGZproducts/c6fd9e7p9unuo4awg9bq.jpg",
            product: "658dad0fac4c8d58272469ea",
          },
          {
            name: "Test Product 2",
            price: 49.99,
            quantity: 1,
            image:
              "https://res.cloudinary.com/dsqjoidmi/image/upload/v1703783728/IGZproducts/svjjp7rjvosx5o0bdess.jpg",
            product: "658dad33ac4c8d58272469f0",
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
            name: "Test Product 1",
            price: 22.99,
            quantity: 3,
            image:
              "https://res.cloudinary.com/dsqjoidmi/image/upload/v1703783693/IGZproducts/c6fd9e7p9unuo4awg9bq.jpg",
            product: "658dad0fac4c8d58272469ea",
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
            name: "Test Product 1",
            price: 22.99,
            quantity: 3,
            image:
              "https://res.cloudinary.com/dsqjoidmi/image/upload/v1703783693/IGZproducts/c6fd9e7p9unuo4awg9bq.jpg",
            product: "658dad0fac4c8d58272469ea",
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

        // Store order id
        orderId = res.body.userOrder._id;

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
            name: "Test Product 1",
            price: 22.99,
            quantity: 3,
            image:
              "https://res.cloudinary.com/dsqjoidmi/image/upload/v1703783693/IGZproducts/c6fd9e7p9unuo4awg9bq.jpg",
            product: "658dad0fac4c8d58272469ea",
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

describe("DELETE /api/order/:id", () => {
  it("should delete order from database", async () => {
    try {
      // Authorize as Test Seller
      const loginRes = await request(app).post("/api/shop/login").send({
        shopEmail: process.env.SELLER_TEST_EMAIL,
        password: "reallygood!",
      });
      sellerToken = loginRes.body.token;

      const delRes = await request(app)
        .delete(`/api/order/${orderId}`)
        .set("Accept", "application/json")
        .set("Cookie", [`shop_token=${sellerToken}`])
        .expect("Content-Type", /json/)
        .expect(200);

      // Assert that the response contains the success message
      expect(delRes.body).toHaveProperty("success", true);
      expect(delRes.body).toHaveProperty(
        "message",
        "Order Deleted successfully"
      );
    } catch (error) {
      throw error;
    }
  });

  it("should return error if there is no order with this id", (done) => {
    request(app)
      .delete(`/api/order/64b510cc5c620d7bef933d5f`)
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
          "Order not found with id: 64b510cc5c620d7bef933d5f"
        );
        done();
      });
  });
});
