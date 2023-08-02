import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const shopSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: [true, "Please enter shop name"],
    unique: true,
  },
  shopEmail: {
    type: String,
    required: [true, "Please enter your email"],
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: "Please enter valid email address",
    },
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password should be greater than 6 characters"],
    select: false,
  },
  phoneNumber: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{9,14}$/.test(v);
      },
      message: "Please enter a valid phone number",
    },
  },
  address: {
    type: String,
    required: true,
  },
  zipCode: {
    type: Number,
    required: true,
  },
  availableBalance: {
    type: Number,
    default: 0.0,
  },
  withdrawMethod: {
    type: mongoose.Schema.ObjectId,
    ref: "Withdraw",
  },
  transactions: [
    {
      amount: {
        type: Number,
      },
      status: {
        type: String,
        default: "Processing",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
      },
    },
  ],
  logo: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "Seller",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  shopActivationToken: String,
  shopActivationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Create unique index for shopEmail field
shopSchema.index({ shopEmail: 1 }, { unique: true });

// Encrypting password before saving shop
shopSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// Compare shop password
shopSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Return JWT token
shopSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.SHOP_JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

// Generate password reset token
shopSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash and set to resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set token expire time
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

// Return Activation token
shopSchema.methods.getShopActivationToken = function () {
  // Generate token
  const activationToken = crypto.randomBytes(20).toString("hex");

  // Hash and set to activationToken
  this.shopActivationToken = crypto
    .createHash("sha256")
    .update(activationToken)
    .digest("hex");

  // Set token expire time
  this.shopActivationExpire = Date.now() + 10 * 60 * 1000;

  return activationToken;
};

export default mongoose.model("Shop", shopSchema);
