import axios from "axios";
import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  message: "",
  email: "",
  error: null,
};

// Forgot password
export const forgotPassword = createAsyncThunk(
  "forgotPassword/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        `/api/password/forgot`,
        { email },
        config
      );

      return {
        email,
        message: data.message,
      };
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
      .addMatcher(isAnyOf(forgotPassword.pending), (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(isAnyOf(forgotPassword.rejected), (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addDefaultCase((state, action) => {
        return state;
      });
  },
});

export const { clearMessage, clearErrors } = forgotPasswordSlice.actions;

export default forgotPasswordSlice.reducer;
