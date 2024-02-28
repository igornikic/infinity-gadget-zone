import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  shop: {},
  loading: false,
  error: null,
};

// Get shop details
export const shopInfo = createAsyncThunk(
  "shopInfo/shopInfo",
  async (id, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.get(`/api/shop/info/${id}`, config);

      return data.shop;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const shopInfoSlice = createSlice({
  name: "shopInfo",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(shopInfo.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(shopInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.shop = action.payload;
      })
      .addCase(shopInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addDefaultCase((state, action) => {
        return state;
      });
  },
});

export const { clearErrors } = shopInfoSlice.actions;

export default shopInfoSlice.reducer;
