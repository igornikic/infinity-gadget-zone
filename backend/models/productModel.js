import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true,
    match: [
      /^.{3,100}$/,
      "Product name must be between 3 and 100 characters long",
    ],
  },
  price: {
    type: Number,
    required: [true, "Please enter product price"],
    min: [0, "Product price cannot be less than 0"],
    default: 0.0,
  },
  description: {
    type: String,
    required: [true, "Please enter product description"],
    match: [
      /^.{50,4000}$/,
      "Product description must be between 50 and 4000 characters long",
    ],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, "Please select category for this product"],
    enum: {
      values: [
        "Fashion",
        "Electronics",
        "Home & Furniture",
        "Beauty & Health",
        "Groceries & Food",
        "Books, Movies & Music",
        "Sports & Outdoors",
        "Jewelry & Watches",
        "Toys & Games",
        "Baby & Kids",
        "Automotive & Tools",
        "Pet Supplies",
        "Gifts & Occasions",
      ],
      message: "Please select correct category for product",
    },
  },
  stock: {
    type: Number,
    required: [true, "Please enter product stock"],
    min: [1, "Product stock cannot be less than 1"],
    default: 1,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
    required: true,
  },
  coupons: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Coupon",
    },
  ],
  sold: {
    type: Number,
    default: 0,
  },
  views: [
    {
      _id: false,
      viewerId: String,
      viewedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  totalViews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Product", productSchema);
