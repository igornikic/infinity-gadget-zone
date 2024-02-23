import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  success: false,
  loading: false,
  error: null,
};

// Create review
export const newReview = createAsyncThunk(
  "newReview/newReview",
  async (reviewData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.put(`/api/review`, reviewData, config);

      return data.success;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const newReviewSlice = createSlice({
  name: "newReview",
  initialState,
  reducers: {
    newReviewReset: (state) => {
      state.success = false;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(newReview.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(newReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;
      })
      .addCase(newReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addDefaultCase((state, action) => {
        return state;
      });
  },
});

export const { newReviewReset, clearErrors } = newReviewSlice.actions;

export default newReviewSlice.reducer;
