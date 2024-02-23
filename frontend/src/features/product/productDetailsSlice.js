import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  product: {},
  loading: false,
  error: null,
};

// Get product details
export const productDetails = createAsyncThunk(
  "productDetails/productDetails",
  async (id, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.get(`/api/product/${id}`, config);

      return data.product;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const productDetailsSlice = createSlice({
  name: "productDetails",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(productDetails.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(productDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(productDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addDefaultCase((state, action) => {
        return state;
      });
  },
});

export const { clearErrors } = productDetailsSlice.actions;

export default productDetailsSlice.reducer;
