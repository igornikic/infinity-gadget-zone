import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  reviews: [],
  loading: false,
  error: null,
};

// Get product reviews
export const productReviews = createAsyncThunk(
  "productReviews/productReviews",
  async (id, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.get(`/api/reviews?id=${id}`, config);

      return data.reviews;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const productReviewsSlice = createSlice({
  name: "productReviews",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(productReviews.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(productReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(productReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addDefaultCase((state, action) => {
        return state;
      });
  },
});

export const { clearErrors } = productReviewsSlice.actions;

export default productReviewsSlice.reducer;
