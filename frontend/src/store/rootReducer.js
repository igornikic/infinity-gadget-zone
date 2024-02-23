import { combineReducers } from "redux";

// Import user related reducers
import authReducer from "../features/user/authSlice";
import userReducer from "../features/user/userSlice";
import forgotPasswordReducer from "../features/forgotPassword/forgotPasswordSlice";

// Import shop related reducers
import shopAuthReducer from "../features/shop/shopAuthSlice";

// Import product related reducers
import newProductReducer from "../features/product/newProductSlice";
import productDetailsReducer from "../features/product/productDetailsSlice";
import productReviewsReducer from "../features/product/productReviewsSlice";
import newReviewReducer from "../features/product/newReviewSlice";
import productsReducer from "../features/product/productsSlice";
import deleteReviewReducer from "../features/product/deleteReviewSlice";

// Import cart related reducers
import cartReducer from "../features/cart/cartSlice";
import couponReducer from "../features/cart/couponSlice";

// Combines all reducers into one rootReducer
const rootReducer = combineReducers({
  // User related reducers
  auth: authReducer,
  user: userReducer,
  forgotPassword: forgotPasswordReducer,
  // Shop related reducers
  shopAuth: shopAuthReducer,
  // Product related reducers
  newProduct: newProductReducer,
  products: productsReducer,
  productDetails: productDetailsReducer,
  newReview: newReviewReducer,
  productReviews: productReviewsReducer,
  deleteReview: deleteReviewReducer,
  // Cart related reducers
  cart: cartReducer,
  coupon: couponReducer,
});

export default rootReducer;
