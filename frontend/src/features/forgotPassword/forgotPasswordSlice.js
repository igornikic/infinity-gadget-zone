import axios from "axios";
import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  success: false,
  message: "",
  email: "",
  error: null,
};

// Forgot password
export const forgotPassword = createAsyncThunk(
  "forgotPassword/forgotPassword",
  async ({ path, email }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const isShopPasswordForgot = path === "/shop/password/forgot";

      const requestData = isShopPasswordForgot
        ? { shopEmail: email }
        : { email };

      const { data } = await axios.post(`/api${path}`, requestData, config);

      return {
        email: requestData.shopEmail || requestData.email,
        message: data.message,
      };
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  "forgotPassword/resetPassword",
  async ({ path, passwords }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.put(`/api${path}`, passwords, config);

      return data.success;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const forgotPasswordSlice = createSlice({
  name: "forgotPassword",
  initialState,
  reducers: {
    clearMessage: (state) => {
      state.message = "";
      state.success = false;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.email = action.payload.email;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;
      })
      .addMatcher(
        isAnyOf(forgotPassword.pending, resetPassword.pending),
        (state, action) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(forgotPassword.rejected, resetPassword.rejected),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addDefaultCase((state, action) => {
        return state;
      });
  },
});

export const { clearMessage, clearErrors } = forgotPasswordSlice.actions;

export default forgotPasswordSlice.reducer;
