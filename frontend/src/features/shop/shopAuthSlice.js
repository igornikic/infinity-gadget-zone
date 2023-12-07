import axios from "axios";
import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";

const initialState = {
  shop: {},
  loading: false,
  isSeller: false,
  message: "",
  error: null,
};

// Register new shop
export const newShop = createAsyncThunk(
  "shopAuth/newShop",
  async (shopData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(`/api/shop/new`, shopData, config);

      return data.message;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Activate shop
export const activateShop = createAsyncThunk(
  "shopAuth/activateShop",
  async (token, { rejectWithValue }) => {
    try {
      const config = {
        headers: { "Content-Type": "application/json" },
      };

      const { data } = await axios.put(`/api/shop/activate/${token}`, config);

      return data.shop;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Login shop
export const loginShop = createAsyncThunk(
  "shopAuth/loginShop",
  async ({ shopEmail, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        `/api/shop/login`,
        { shopEmail, password },
        config
      );

      return data.shop;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Get Seller Shop
export const getSellerShop = createAsyncThunk(
  "shopAuth/getSellerShop",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/shop/me`);

      return data.shop;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Logout shop
export const logoutShop = createAsyncThunk(
  "shopAuth/logoutShop",
  async (_, { rejectWithValue }) => {
    try {
      await axios.get(`/api/shop/logout`);
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const shopAuthSlice = createSlice({
  name: "shopAuth",
  initialState,
  reducers: {
    clearMessage: (state) => {
      state.message = "";
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(newShop.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(logoutShop.fulfilled, (state, action) => {
        state.loading = false;
        state.isSeller = false;
        state.shop = null;
      })
      .addCase(logoutShop.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addMatcher(
        isAnyOf(newShop.pending, activateShop.pending, loginShop.pending),
        (state, action) => {
          state.loading = true;
          state.isSeller = false;
        }
      )
      .addMatcher(
        isAnyOf(
          loginShop.fulfilled,
          activateShop.fulfilled,
          getSellerShop.fulfilled
        ),
        (state, action) => {
          state.loading = false;
          state.isSeller = true;
          state.shop = action.payload;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(
          newShop.rejected,
          activateShop.rejected,
          loginShop.rejected,
          getSellerShop.rejected
        ),
        (state, action) => {
          state.loading = false;
          state.isSeller = false;
          state.shop = null;
          state.error = action.payload;
        }
      )
      .addDefaultCase((state, action) => {
        return state;
      });
  },
});

export const { clearMessage, clearErrors } = shopAuthSlice.actions;

export default shopAuthSlice.reducer;
