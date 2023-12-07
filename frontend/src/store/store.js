import storage from "redux-persist/lib/storage";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";

import stateEncryptor from "./stateEncryptor";
import rootReducer from "./rootReducer";

// Configuration for persisting state using redux-persist
const persistConfig = {
  key: "root",
  storage,
  transforms: [stateEncryptor],
  whitelist: ["auth", "shopAuth", "forgotPassword"],
};

// Creates new persisted reducer using rootReducer and persistConfig
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configures Redux store
const store = configureStore({
  reducer: persistedReducer,
  devTools: import.meta.env.VITE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
