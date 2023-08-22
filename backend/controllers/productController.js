import Product from "../models/productModel.js";
import Shop from "../models/shopModel.js";
import { v2 as cloudinary } from "cloudinary";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

// @desc    Create new product (Seller only)
// @route   POST /api/product/new
// @access  Private/Seller
export const newProduct = catchAsyncErrors(async (req, res, next) => {
  const shop = await Shop.findById(req.body.shop);

  if (!shop) {
    return next(new ErrorHandler("Shop not found", 404));
  }

  // Get array of images from req body
  const images = req.body.images;
  // Variable to store Cloudinary image links
  let imagesLinks = [];

  // Loop through provided images and upload them to Cloudinary
  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.uploader.upload(images[i], {
      folder: "IGZproducts",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  // Replace images in req body with uploaded image links
  req.body.images = imagesLinks;

  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    // If product creation fails, delete uploaded images from Cloudinary
    imagesLinks.forEach(async (image) => {
      await cloudinary.uploader.destroy(image.public_id);
    });
    return next(error);
  }
});
