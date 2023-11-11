import { combineReducers } from "redux";

// Import user related reducers
import authReducer from "../features/user/authSlice";
import userReducer from "../features/user/userSlice";
import forgotPasswordReducer from "../features/user/forgotPasswordSlice";

// Combines all reducers into one rootReducer
const rootReducer = combineReducers({
  // User related reducers
  auth: authReducer,
  user: userReducer,
  forgotPassword: forgotPasswordReducer,
});

export default rootReducer;
