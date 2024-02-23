import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { updateCartItems } from "./cartSlice";

const initialState = {
  coupon: {},
  loading: false,
  error: null,
};

// Apply Coupon
export const applyCoupon = createAsyncThunk(
  "coupon/applyCoupon",
  async ({ code, product }, { dispatch, rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const productId = product.productId;

      const response = await axios.get(
        `/api/coupon/apply?productId=${productId}&code=${code}`,
        config
      );

      const coupon = response.data.coupon;

      if (response.status === 200) {
        // Retrieve existing cart items from localStorage
        const existingCartItems =
          JSON.parse(localStorage.getItem("cartItems")) || [];

        let itemQuantityToDiscount = product.quantity;
        let couponsUsed;

        // Check if we got enough coupons discount every unit, if not discount max possible
        if (coupon.numOfCoupons < itemQuantityToDiscount) {
          itemQuantityToDiscount = coupon.numOfCoupons;
          couponsUsed = coupon.numOfCoupons;
        } else {
          couponsUsed = itemQuantityToDiscount;
        }

        // Calculate item discount based on discount type
        const itemDiscount =
          coupon.discountType === "amount"
            ? coupon.discountValue * itemQuantityToDiscount
            : (coupon.discountValue / 100) *
              product.price *
              itemQuantityToDiscount;

        // Find item in array that matches given productId
        const updatedCartItems = existingCartItems.map((item) => {
          if (item.productId === productId) {
            // Append couponCode property
            return {
              ...item,
              couponCode: code,
              discountValue: itemDiscount.toFixed(2),
              productsDiscounted: couponsUsed,
            };
          }
          return item;
        });

        // Update localStorage item with applied code
        localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));

        // Update cartItems in redux store
        dispatch(updateCartItems(updatedCartItems));
      }

      return coupon;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyCoupon.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = action.payload;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addDefaultCase((state, action) => {
        return state;
      });
  },
});

export const { clearErrors } = couponSlice.actions;

export default couponSlice.reducer;
