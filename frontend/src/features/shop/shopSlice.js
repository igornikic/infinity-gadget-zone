import axios from "axios";
import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  isUpdated: false,
  isDeleted: false,
  error: null,
};

// Update shop
export const updateShop = createAsyncThunk(
  "shop/updateShop",
  async (shopData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.put(`/api/shop/me/update`, shopData, config);

      return data.success;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    updateShopReset: (state) => {
      state.isUpdated = false;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(isAnyOf(updateShop.pending), (state, action) => {
        state.loading = true;
      })
      .addMatcher(isAnyOf(updateShop.fulfilled), (state, action) => {
        state.loading = false;
        state.isUpdated = action.payload;
      })
      .addMatcher(isAnyOf(updateShop.rejected), (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addDefaultCase((state, action) => {
        return state;
      });
  },
});

export const { updateShopReset, clearErrors } = shopSlice.actions;

export default shopSlice.reducer;
