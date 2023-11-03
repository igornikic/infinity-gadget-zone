import { combineReducers } from "redux";

// Import user reducers
import authReducer from "../features/user/authSlice";

// Combines all reducers into one rootReducer
const rootReducer = combineReducers({
  // User reducers
  auth: authReducer,
});

export default rootReducer;
