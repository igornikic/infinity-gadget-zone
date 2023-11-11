import Shop from "../../models/shopModel.js";

import request from "supertest";
import app from "../../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import cloudinary from "cloudinary";

import connectDatabase from "../../config/database.js";
import testLogo from "../../__mocks__/test-logo.js";

// Setting up config file
dotenv.config({ path: "config/config.env" });

// Setting up cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Variable to store user token for admin account
let adminToken;

// Array to store public IDs of uploaded logos
let uploadedLogoPublicIds = [];

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();

  // Authorize as Test
  const res = await request(app).post("/api/login").send({
    email: process.env.ADMIN_TEST_EMAIL,
    password: "sickPassword!",
  });
  adminToken = res.body.token;
});

// Disconnects from MongoDB database
afterAll(async () => {
  // Delete test shops from database after all tests
  const shopNames = ["Test Shop1"];
  await Shop.deleteMany({ shopName: { $in: shopNames } });

  // Delete all logoss from cloudinary after all tests
  uploadedLogoPublicIds.forEach(async (publicId) => {
    await cloudinary.uploader.destroy(publicId);
  });

  await mongoose.connection.close();
});

// Fixed activation token
const activationToken = "7372bc1599f6bf2b5e6ab5284a13692dc169e200";

// Make fixed token valid for Test Shop without getting actual from email
const setValidActivationToken = async () => {
  // Hash the fixed test token as you would for a real token
  const hashedTestActivationToken = crypto
    .createHash("sha256")
    .update(activationToken)
    .digest("hex");

  // Store hashed test activation token and valid expiration time in database for TestSeller shop
  const testShop = await Shop.findOne({ shopName: "Test Shop1" });

  const expirationTime = Date.now() + 60 * 60 * 1000;

  testShop.shopActivationToken = hashedTestActivationToken;
  testShop.shopActivationExpire = expirationTime;

  await testShop.save();
};

// Make activation token time to expired
const expireActivation = async () => {
  const testShop = await Shop.findOne({ shopName: "Test Shop2" });

  // Set activation time to expired one
  testShop.shopActivationExpire = Date.now() - 5 * 60 * 1000;

  await testShop.save();
};

describe("POST /api/shop/new", () => {
  it("should create new shop", (done) => {
    request(app)
      .post("/api/shop/new")
      .send({
        shopName: "Test Shop1",
        shopEmail: "testShop1@gmail.com",
        password: "reallygood!",
        confirmPassword: "reallygood!",
        phoneNumber: "123456789",
        address: "123 Avenija 67",
        zipCode: "3456",
        logo: testLogo,
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the success message
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty(
          "message",
          `Email sent to: testShop1@gmail.com`
        );

        done();
      });
  });

  it("should create new shop but this one won't be activated later", (done) => {
    request(app)
      .post("/api/shop/new")
      .send({
        shopName: "Test Shop2",
        shopEmail: "testShop2@gmail.com",
        password: "reallygood!",
        confirmPassword: "reallygood!",
        phoneNumber: "123456789",
        address: "123 Avenija 67",
        zipCode: "3456",
        logo: testLogo,
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        expireActivation();

        // Assert that the response contains the success message
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty(
          "message",
          `Email sent to: testShop2@gmail.com`
        );

        done();
      });
  });

  it("should return an error if passwords do not match", (done) => {
    request(app)
      .post("/api/shop/new")
      .send({
        shopName: "Test Shop5",
        shopEmail: "testShop5@gmail.com",
        password: "reallygood!",
        confirmPassword: "reallygood!123", // Different password for confirmation
        phoneNumber: "123456789",
        address: "123 Avenija 67",
        zipCode: "3456",
        logo: testLogo,
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 400 });
        expect(res.body).toHaveProperty("message", "Passwords do not match");
        done();
      });
  });

  it("should return an error if the shop name is already taken", (done) => {
    request(app)
      .post("/api/shop/new")
      .send({
        shopName: "Test Shop4",
        shopEmail: process.env.SELLER_TEST_EMAIL,
        password: "reallygood!",
        confirmPassword: "reallygood!",
        phoneNumber: "123456789",
        address: "123 Avenija 67",
        zipCode: "3456",
        logo: testLogo,
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(409)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", {
          statusCode: 409,
        });
        expect(res.body).toHaveProperty("message", "Shop name already taken");

        done();
      });
  });

  it("should return an error if email is already taken", (done) => {
    request(app)
      .post("/api/shop/new")
      .send({
        shopName: "Test Shop3",
        shopEmail: process.env.SELLER_TEST_EMAIL,
        password: "reallygood!",
        confirmPassword: "reallygood!",
        phoneNumber: "123456789",
        address: "123 Avenija 67",
        zipCode: "3456",
        logo: testLogo,
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(409)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", {
          statusCode: 409,
        });
        expect(res.body).toHaveProperty("message", "Shop email already taken");

        done();
      });
  });

  it("should return an error if required fields are empty", (done) => {
    request(app)
      .post("/api/shop/new")
      .send({
        shopName: "",
        shopEmail: process.env.SELLER_TEST_EMAIL,
        password: "reallygood!",
        confirmPassword: "reallygood!",
        phoneNumber: "123456789",
        address: "123 Avenija 67",
        zipCode: "3456",
        logo: testLogo,
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", {
          statusCode: 400,
        });
        expect(res.body).toHaveProperty(
          "message",
          "ValidationError: shopName: Please enter shop name"
        );

        done();
      });
  });
});

describe("400 /api/shop/login", () => {
  it("should return an error if shop account is not activated", (done) => {
    request(app)
      .post("/api/shop/login")
      .send({
        shopEmail: "testShop2@gmail.com",
        password: "reallygood!",
      })
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
          "Please activate your shop by clicking the link in the email we sent you"
        );
        done();
      });
  });
});

describe("PUT /api/shop/activate/:token", () => {
  it("should activate shop account", async () => {
    try {
      await setValidActivationToken();
      const res = await request(app)
        .put(`/api/shop/activate/${activationToken}`)
        .expect(200);

      const publicId = res.body.shop.logo.public_id;
      uploadedLogoPublicIds.push(publicId);

      // Assert that the response contains a token
      expect(res.body).toHaveProperty("token");

      // Assert that the response contains shop
      expect(res.body).toHaveProperty("shop");
      expect(res.body.shop).toHaveProperty("shopName", "Test Shop1");

      // Assert that the response contains the options for the "shop_token" cookie
      expect(res.body).toHaveProperty("options");
      expect(res.body.options).toHaveProperty("expires");
      expect(res.body.options).toHaveProperty("httpOnly", true);
      expect(res.body.options).toHaveProperty("path", "/");
    } catch (error) {
      throw error;
    }
  });

  it("should return an error if activation token is invalid or expired", (done) => {
    request(app)
      .put("/api/shop/activate/7372bc1599f6bf2b5e6ab5284a13692dc169e201")
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 400 });
        expect(res.body).toHaveProperty(
          "message",
          "Activation token is invalid or has expired"
        );
        done();
      });
  });
});

describe("POST /api/shop/login", () => {
  it("should login with shop account and return a token", (done) => {
    request(app)
      .post("/api/shop/login")
      .send({
        shopEmail: process.env.SELLER_TEST_EMAIL,
        password: "reallygood!",
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains a token
        expect(res.body).toHaveProperty("token");

        // Assert that the response contains shop
        expect(res.body).toHaveProperty("shop");
        expect(res.body.shop).toHaveProperty("shopName", "Test Shop4");

        // Assert that the response contains the options for the "shop_token" cookie
        expect(res.body).toHaveProperty("options");
        expect(res.body.options).toHaveProperty("expires");
        expect(res.body.options).toHaveProperty("httpOnly", true);
        expect(res.body.options).toHaveProperty("path", "/");

        done();
      });
  });

  it("should return an error if email or password is empty", (done) => {
    request(app)
      .post("/api/shop/login")
      .send({
        shopEmail: "",
        password: "reallygood!",
      })
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
          "Please enter email and password"
        );
        done();
      });
  });

  it("should return an error if password is incorrect", (done) => {
    request(app)
      .post("/api/shop/login")
      .send({
        shopEmail: process.env.SELLER_TEST_EMAIL,
        password: "password456",
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 401 });
        expect(res.body).toHaveProperty("message", "Invalid Email or Password");
        done();
      });
  });

  it("should return an error if email is invalid", (done) => {
    request(app)
      .post("/api/shop/login")
      .send({
        shopEmail: "testUser.com",
        password: "reallygood!",
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 401 });
        expect(res.body).toHaveProperty("message", "Invalid Email or Password");
        done();
      });
  });
});

describe("GET /api/shop/logout", () => {
  it("should logout from shop account and set token to null", (done) => {
    request(app)
      .get("/api/shop/logout")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("message", "Logged out");
        done();
      });
  });
});

// For admin accounts
describe("DELETE /api/admin/shops", () => {
  it("should delete all unactivated shop accounts from database", (done) => {
    request(app)
      .delete("/api/admin/shops")
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains success message
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("deleted", 1);
        expect(res.body).toHaveProperty(
          "message",
          "Expired shops and their logos deleted successfully"
        );

        done();
      });
  });
});
