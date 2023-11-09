import { combineReducers } from "redux";

// Import user related reducers
import authReducer from "../features/user/authSlice";
import userReducer from "../features/user/userSlice";

// Combines all reducers into one rootReducer
const rootReducer = combineReducers({
  // User related reducers
  auth: authReducer,
  user: userReducer,
});

export default rootReducer;
