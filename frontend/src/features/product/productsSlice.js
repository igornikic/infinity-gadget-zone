import axios from "axios";
import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  loading: false,
  error: null,
};

// Get all products
export const getProducts = createAsyncThunk(
  "products/getProducts",
  async (
    { keyword, currentPage, price, category, rating, sort },
    { rejectWithValue }
  ) => {
    try {
      // Encode the value to handle special characters like '&' in URLs
      const encodedKeyword = encodeURIComponent(keyword);

      let link = `/api/products?keyword=${encodedKeyword}&page=${currentPage}&price[lte]=${price[1]}&price[gte]=${price[0]}&ratings[gte]=${rating}&sort=${sort}`;

      if (category != "") {
        // Encode the value to handle special characters like '&' in URLs
        const encodedCategory = encodeURIComponent(category);

        link = `/api/products?keyword=${encodedKeyword}&page=${currentPage}&price[lte]=${price[1]}&price[gte]=${price[0]}&category=${encodedCategory}&ratings[gte]=${rating}&sort=${sort}`;
      }

      const { data } = await axios.get(link);

      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Get all shop products
export const getShopProducts = createAsyncThunk(
  "products/getShopProducts",
  async (
    { id, keyword, currentPage, price, category, rating, sort },
    { rejectWithValue }
  ) => {
    try {
      // Encode the value to handle special characters like '&' in URLs
      const encodedKeyword = encodeURIComponent(keyword);

      let link = `/api/products/shop/${id}?keyword=${encodedKeyword}&page=${currentPage}&price[lte]=${price[1]}&price[gte]=${price[0]}&ratings[gte]=${rating}&sort=${sort}`;

      if (category != "") {
        // Encode the value to handle special characters like '&' in URLs
        const encodedCategory = encodeURIComponent(category);

        link = `/api/products/shop/${id}?keyword=${encodedKeyword}&page=${currentPage}&price[lte]=${price[1]}&price[gte]=${price[0]}&category=${encodedCategory}&ratings[gte]=${rating}&sort=${sort}`;
      }

      const { data } = await axios.get(link);

      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        isAnyOf(getProducts.pending, getShopProducts.pending),
        (state, action) => {
          state.loading = true;
          state.products = [];
        }
      )
      .addMatcher(
        isAnyOf(getProducts.fulfilled, getShopProducts.fulfilled),
        (state, action) => {
          state.loading = false;
          state.products = action.payload.products;
          state.productsCount = action.payload.productsCount;
          state.resPerPage = action.payload.resPerPage;
          state.filteredProductsCount = action.payload.filteredProductsCount;
        }
      )
      .addMatcher(
        isAnyOf(getProducts.rejected, getShopProducts.rejected),
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

export const { clearErrors } = productsSlice.actions;

export default productsSlice.reducer;
