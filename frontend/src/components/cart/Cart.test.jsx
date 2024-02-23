import React from "react";
import { rest } from "msw";

import Cart from "./Cart";
import CouponSuccess from "./CouponSuccess";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "../utils/test-utils.jsx";
import { server } from "../../mocks/server.js";
import { productTestData as ptd } from "../../test-data/product/productTestData.js";
import { couponTestData as ctd } from "../../test-data/coupon/couponTestData.js";

const initialState = {
  cart: {
    cartItems: [
      {
        ...ptd,
        quantity: 2,
        stock: 3,
        productsDiscounted: 1,
        discountValue: 20,
        couponCode: "1111-XYWZ-1234",
      },
    ],
  },
};

const initialState2 = {
  cart: {
    cartItems: [
      {
        ...ptd,
        quantity: 1,
        productsDiscounted: 1,
        discountValue: 20,
        couponCode: "1111-XYWZ-1234",
      },
      {
        ...ptd,
        quantity: 2,
        productsDiscounted: 1,
        discountValue: 20,
        couponCode: "1111-XYWZ-1234",
      },
    ],
  },
};

describe("Cart add and remove items tests", () => {
  it("should change cart product quantity multiple times", async () => {
    // render Cart component
    render(<Cart />, {
      initialState,
    });

    const increaseQtyButton = screen.getByRole("button", { name: "+" });
    const decreaseQtyButton = screen.getByRole("button", { name: "-" });

    fireEvent.click(increaseQtyButton);
    fireEvent.click(decreaseQtyButton);
  });

  it("should return an error on add to cart", async () => {
    const { store } = render(<Cart />, {
      initialState,
    });

    // Mock server to respond with an error
    server.use(
      rest.get("/api/product/:id", (req, res, ctx) => {
        return res(
          ctx.status(404),
          ctx.json({
            message: "Product not found",
          })
        );
      })
    );

    const addToCartButton = screen.getByRole("button", {
      name: "+",
    });

    fireEvent.click(addToCartButton);

    // Wait for the "Product not found" message to appear
    await waitFor(() => {
      expect(screen.getByText("Product not found")).toBeInTheDocument();
    });

    // Check state of cart slice in Redux store
    const cartState = store.getState().cart;

    expect(cartState.error).toBe("Product not found");

    // Wait 500ms for message to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of cart slice in Redux store
    const cartState2 = store.getState().cart;
    expect(cartState2.error).toBe(null);
  });

  it("should remove item from cart", async () => {
    // render Cart component
    render(<Cart />, {
      initialState: {
        cart: {
          cartItems: [
            {
              ...ptd,
              quantity: 1,
            },
          ],
        },
      },
    });

    const removeItemButton = screen.getByRole("button", {
      name: "X",
    });

    await act(async () => {
      fireEvent.click(removeItemButton);
    });
  });
});

describe("/coupon/apply", () => {
  it("should apply coupon code to product", async () => {
    // render Cart component
    render(<Cart />, { initialState: initialState2 });

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      "code-input1-1": "1111",
      "code-input1-2": "XYWZ",
      "code-input1-3": "1234",
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    const applyButtons = screen.getAllByRole("button", {
      name: "Apply Coupon",
    });
    fireEvent.click(applyButtons[0]);
  });

  it("should should return an error if coupon code is invalid", async () => {
    // render Cart component
    const { store } = render(<Cart />, { initialState: initialState2 });

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      "code-input1-1": "1111",
      "code-input1-2": "XYWZ",
      "code-input1-3": "1234",
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }
    // Mock server to respond with an error when apply coupon request is made
    server.use(
      rest.get(`/api/coupon/apply`, (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            success: false,
            message: "Incorrect coupon code. Attempt 1/10",
          })
        );
      })
    );

    const applyButtons = screen.getAllByRole("button", {
      name: "Apply Coupon",
    });
    fireEvent.click(applyButtons[0]);

    // Wait for loading to end
    await act(async () => {
      store.getState().coupon.loading === false;
    });

    // Wait for the "Incorrect coupon code. Attempt 1/10" message to appear
    await waitFor(() => {
      expect(
        screen.getByText("Incorrect coupon code. Attempt 1/10")
      ).toBeInTheDocument();
    });

    // Check state of coupon slice in Redux store
    const couponState = store.getState().coupon;
    expect(couponState.loading).toBe(false);
    expect(couponState.error).toBe("Incorrect coupon code. Attempt 1/10");

    // Wait 500ms for message to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of coupon slice in Redux store
    const couponState2 = store.getState().coupon;
    expect(couponState2.error).toBe(null);
  });

  it("should render coupon success popup", () => {
    // render CouponSuccess component
    render(
      <CouponSuccess coupon={ctd} discountValue={20} productsDiscounted={1} />
    );
  });
});
