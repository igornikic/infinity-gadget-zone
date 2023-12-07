import { combineReducers } from "redux";

// Import user related reducers
import authReducer from "../features/user/authSlice";
import userReducer from "../features/user/userSlice";
import forgotPasswordReducer from "../features/forgotPassword/forgotPasswordSlice";

// Import shop related reducers
import shopAuthReducer from "../features/shop/shopAuthSlice";

// Import product related reducers
import newProductReducer from "../features/product/newProductSlice";

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
});

export default rootReducer;
