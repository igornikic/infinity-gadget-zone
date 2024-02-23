import axios from "axios";
import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  error: null,
};

export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  async ({ id, quantity }, { getState, rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      // Get current cart items from the state
      let cartState = getState().cart.cartItems;

      const { data } = await axios.get(`/api/product/${id}`, config);

      // Create new item object
      const newItem = {
        productId: data.product._id,
        name: data.product.name,
        price: data.product.price,
        stock: data.product.stock,
        image: data.product.images[0].url,
        quantity,
      };

      // Check if the item already exists in the cart
      const isItemExist = cartState.find(
        (item) => item.productId === newItem.productId
      );

      // If item exists, update its quantity, otherwise add it to the cart
      if (isItemExist) {
        cartState = cartState.map((item) =>
          item.productId === isItemExist.productId ? newItem : item
        );
      } else {
        cartState = [...cartState, newItem];
      }

      // Store updated cart items in local storage
      localStorage.setItem("cartItems", JSON.stringify(cartState));

      return cartState;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  "cart/removeItemFromCart",
  (id, { getState, rejectWithValue }) => {
    try {
      let cartState = getState().cart.cartItems;

      cartState = cartState.filter((item) => item.productId !== id);

      localStorage.setItem("cartItems", JSON.stringify(cartState));

      return cartState;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    updateCartItems: (state, action) => {
      state.cartItems = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        isAnyOf(addItemToCart.fulfilled, removeItemFromCart.fulfilled),
        (state, action) => {
          state.cartItems = action.payload;
        }
      )
      .addMatcher(
        isAnyOf(addItemToCart.rejected, removeItemFromCart.rejected),
        (state, action) => {
          state.error = action.payload;
        }
      )
      .addDefaultCase((state, action) => {
        return state;
      });
  },
});

export const { clearErrors, updateCartItems } = cartSlice.actions;

export default cartSlice.reducer;
