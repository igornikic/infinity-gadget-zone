import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter coupon name"],
    trim: true,
    match: [
      /^.{3,100}$/,
      "Coupon name must be between 3 and 100 characters long",
    ],
  },
  code: {
    type: String,
    required: [true, "Please enter coupon code"],
    match: [
      /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
      "Coupon code must be in the format XXXX-XXXX-XXXX",
    ],
  },
  discountType: {
    type: String,
    required: [true, "Please select discount type for this coupon"],
    enum: {
      values: ["percentage", "amount"],
      message: "Please select correct discount type for this coupon",
    },
  },
  discountValue: {
    type: Number,
    required: [true, "Please enter discount value"],
    validate: {
      validator: function (value) {
        if (this.discountType === "percentage") {
          return value > 0 && value <= 100;
        } else if (this.discountType === "amount") {
          return value > 0;
        }
        return false;
      },
      message: "Please enter valid discount value",
    },
  },
  numOfCoupons: {
    type: Number,
    required: [true, "Please enter number of coupons"],
    min: [0, "Number of coupons cannot be less than 0"],
    default: 1,
  },
  expirationDate: {
    type: Date,
    required: [true, "Please enter expiration date"],
    validate: {
      validator: function (date) {
        return date > new Date();
      },
      message: "Expiration date must be in the future",
    },
  },
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
    required: true,
  },
  products: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Please select product"],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create unique index for code field within shop
couponSchema.index({ code: 1, shop: 1 }, { unique: true });

export default mongoose.model("Coupon", couponSchema);
