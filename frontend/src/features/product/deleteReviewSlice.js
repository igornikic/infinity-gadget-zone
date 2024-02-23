import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  isDeleted: false,
  loading: false,
  error: null,
};

// Delete review
export const deleteReview = createAsyncThunk(
  "deleteReview/deleteReview",
  async ({ productId, userId }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.delete(
        `/api/reviews?productId=${productId}&id=${userId}`,
        config
      );

      return data.success;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteReviewSlice = createSlice({
  name: "deleteReview",
  initialState,
  reducers: {
    deleteReviewReset: (state) => {
      state.isDeleted = false;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteReview.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.isDeleted = action.payload;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addDefaultCase((state, action) => {
        return state;
      });
  },
});

export const { deleteReviewReset, clearErrors } = deleteReviewSlice.actions;

export default deleteReviewSlice.reducer;
