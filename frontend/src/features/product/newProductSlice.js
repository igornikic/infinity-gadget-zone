import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  product: {},
  loading: false,
  success: false,
  error: null,
};

// Create new product - Seller
export const newProduct = createAsyncThunk(
  "newProduct/newProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        `/api/product/new`,
        productData,
        config
      );

      return data.product;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const newProductSlice = createSlice({
  name: "newProduct",
  initialState,
  reducers: {
    newProductReset: (state) => {
      state.success = false;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(newProduct.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(newProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.product = action.payload;
      })
      .addCase(newProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addDefaultCase((state, action) => {
        return state;
      });
  },
});

export const { newProductReset, clearErrors } = newProductSlice.actions;

export default newProductSlice.reducer;
