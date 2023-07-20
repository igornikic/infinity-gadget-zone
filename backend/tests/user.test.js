import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "cloudinary";

import testAvatar2 from "../__mocks__/test-avatar2.js";
import connectDatabase from "../config/database.js";

// Setting up config file
dotenv.config({ path: "backend/config/config.env" });

// Setting up cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Variable to store user token for user account
let userToken;
// Variable to store user token for admin account
let adminToken;
// Variable to store avatar url retrieved from cloudinary
let avatarUrl;
// Variable to store id
let id;

// Connects to a MongoDB database
beforeAll(async () => {
  connectDatabase();
  // Authorize as Test
  const res = await request(app).post("/api/login").send({
    email: "testg123789@gmail.com",
    password: "sickPassword!",
  });
  id = res.body.user._id;
  adminToken = res.body.token;
  avatarUrl = res.body.user.avatar.url;
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
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains user
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("username", "TestAdmin");

        done();
      });
  });
});

describe("PUT /api/password/update", () => {
  it("should update user password", (done) => {
    request(app)
      .put("/api/password/update")
      .send({
        oldPassword: "sickPassword!",
        password: "sickPassword123!",
        confirmPassword: "sickPassword123!",
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains a token
        expect(res.body).toHaveProperty("token");

        // Assert that the response contains user
        expect(res.body).toHaveProperty("user");

        // Assert that the response contains the options for the "user_token" cookie
        expect(res.body).toHaveProperty("options");
        expect(res.body.options).toHaveProperty("expires");
        expect(res.body.options).toHaveProperty("httpOnly", true);
        expect(res.body.options).toHaveProperty("sameSite", "none");
        expect(res.body.options).toHaveProperty("path", "/");

        done();
      });
  });

  it("should return error if old user password is incorrect", (done) => {
    request(app)
      .put("/api/password/update")
      .send({
        oldPassword: "12345678",
        password: "sickPassword123!",
        confirmPassword: "sickPassword123!",
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 400 });
        expect(res.body).toHaveProperty("message", "Old password is incorrect");

        done();
      });
  });

  it("should return error if password and confirm password do not match", (done) => {
    request(app)
      .put("/api/password/update")
      .send({
        oldPassword: "sickPassword123!",
        password: "12345678",
        confirmPassword: "123456789",
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 400 });
        expect(res.body).toHaveProperty(
          "message",
          "Password and Confirm Password do not match"
        );

        done();
      });
  });

  it("should return error if old password and new password are same", (done) => {
    request(app)
      .put("/api/password/update")
      .send({
        oldPassword: "sickPassword123!",
        password: "sickPassword123!",
        confirmPassword: "sickPassword123!",
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 400 });
        expect(res.body).toHaveProperty("message", "Password change failed");

        done();
      });
  });

  it("should return error if new password is to short", (done) => {
    request(app)
      .put("/api/password/update")
      .send({
        oldPassword: "sickPassword123!",
        password: "123",
        confirmPassword: "123",
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 422 });
        expect(res.body).toHaveProperty(
          "message",
          "User validation failed: password: Your password must be longer than 6 characters"
        );

        done();
      });
  });

  it("should update user password (back to what was it originally)", (done) => {
    request(app)
      .put("/api/password/update")
      .send({
        oldPassword: "sickPassword123!",
        password: "sickPassword!",
        confirmPassword: "sickPassword!",
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains a token
        expect(res.body).toHaveProperty("token");

        // Assert that the response contains user
        expect(res.body).toHaveProperty("user");

        // Assert that the response contains the options for the "user_token" cookie
        expect(res.body).toHaveProperty("options");
        expect(res.body.options).toHaveProperty("expires");
        expect(res.body.options).toHaveProperty("httpOnly", true);
        expect(res.body.options).toHaveProperty("sameSite", "none");
        expect(res.body.options).toHaveProperty("path", "/");

        done();
      });
  });
});

describe("PUT /api/me/update", () => {
  it("should update user data without uploading avatar because it haven't changed", (done) => {
    request(app)
      .put("/api/me/update")
      .send({
        username: "TestAdmin2",
        firstName: "Test2",
        lastName: "Admin2",
        email: "test@gmail.com",
        avatar: avatarUrl,
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains user
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("username", "TestAdmin2");
        expect(res.body.user).toHaveProperty("firstName", "Test2");
        expect(res.body.user).toHaveProperty("lastName", "Admin2");
        expect(res.body.user).toHaveProperty("email", "test@gmail.com");

        done();
      });
  });

  it("should update user data and upload new avatar", (done) => {
    request(app)
      .put("/api/me/update")
      .send({
        username: "TestAdmin",
        firstName: "Test",
        lastName: "Admin",
        email: "testg123789@gmail.com",
        avatar: testAvatar2,
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains user
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("username", "TestAdmin");
        expect(res.body.user).toHaveProperty("firstName", "Test");
        expect(res.body.user).toHaveProperty("lastName", "Admin");
        expect(res.body.user).toHaveProperty("email", "testg123789@gmail.com");

        done();
      });
  });

  it("should return error if data is invalid", (done) => {
    request(app)
      .put("/api/me/update")
      .send({
        username: "",
        firstName: "Test",
        lastName: "Admin",
        email: "testg123789@gmail.com",
        avatar: testAvatar2,
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 422 });
        expect(res.body).toHaveProperty(
          "message",
          "Validation failed: username: Please enter your username"
        );

        done();
      });
  });
});

// For admin accounts
describe("GET /api/admin/users", () => {
  it("should get all users from database", (done) => {
    request(app)
      .get("/api/admin/users")
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains users
        expect(res.body).toHaveProperty("users");

        done();
      });
  });
});

describe("GET /api/admin/user/:id", () => {
  it("should get user details", (done) => {
    request(app)
      .get(`/api/admin/user/${id}`)
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains user
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("username", "TestAdmin");

        done();
      });
  });

  it("should return error if there is no user with this id", (done) => {
    request(app)
      .get(`/api/admin/user/64b510cc5c620d7bef933d5f`)
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
          "User not found with id: 64b510cc5c620d7bef933d5f"
        );

        done();
      });
  });
});

describe("PUT /api/admin/user/:id", () => {
  it("should update user details", (done) => {
    request(app)
      .put(`/api/admin/user/${id}`)
      .send({
        username: "TestAdmin",
        email: "testg123789@gmail.com",
        role: "admin",
      })
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${adminToken}`])
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains user
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("username", "TestAdmin");
        expect(res.body.user).toHaveProperty("email", "testg123789@gmail.com");
        expect(res.body.user).toHaveProperty("role", "admin");

        done();
      });
  });

  it("should return error if there is no user with this id", (done) => {
    request(app)
      .put(`/api/admin/user/64b510cc5c620d7bef933d5f`)
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
          "User not found with id: 64b510cc5c620d7bef933d5f"
        );

        done();
      });
  });
});

// Login with non admin account
describe("POST /api/login", () => {
  it("should login user and return a token", (done) => {
    request(app)
      .post("/api/login")
      .send({
        email: "igornikic001@gmail.com",
        password: "sickPassword!",
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains a token
        expect(res.body).toHaveProperty("token");

        // Store user token
        userToken = res.body.token;

        done();
      });
  });
});

describe("403 GET /api/admin/users", () => {
  it("should return error if you are not on admin account", (done) => {
    request(app)
      .get("/api/admin/users")
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(403)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 403 });
        expect(res.body).toHaveProperty(
          "message",
          `Role (user) is not allowed to acccess this resource`
        );

        done();
      });
  });
});

describe("403 GET /api/admin/user/:id", () => {
  it("should return error if you are not on admin account", (done) => {
    request(app)
      .get(`/api/admin/user/${id}`)
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(403)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 403 });
        expect(res.body).toHaveProperty(
          "message",
          `Role (user) is not allowed to acccess this resource`
        );

        done();
      });
  });
});

describe("403 PUT /api/admin/user/:id", () => {
  it("should return error if you are not on admin account", (done) => {
    request(app)
      .get(`/api/admin/user/${id}`)
      .set("Accept", "application/json")
      .set("Cookie", [`user_token=${userToken}`])
      .expect("Content-Type", /json/)
      .expect(403)
      .end((err, res) => {
        if (err) return done(err);

        // Assert that the response contains the error message
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("error", { statusCode: 403 });
        expect(res.body).toHaveProperty(
          "message",
          `Role (user) is not allowed to acccess this resource`
        );

        done();
      });
  });
});
