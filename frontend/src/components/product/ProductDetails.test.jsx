import React from "react";
import { rest } from "msw";

import ProductDetails from "./ProductDetails";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "../utils/test-utils.jsx";
import { server } from "../../mocks/server.js";
import { productTestData as ptd } from "../../test-data/product/productTestData.js";

// Define the initial state for the Redux store
const initialState = {
  newReview: {
    success: true,
    loading: false,
    error: null,
  },
  deleteReview: {
    isDeleted: true,
    loading: false,
    error: null,
  },
};

describe("Get /product/:id", () => {
  it("should get product details", async () => {
    // Render ProductDetails component
    const { store } = render(<ProductDetails />, {
      route: `/product/${ptd._id}`,
    });

    // Assert that Product with this id is present
    await screen.findByText(`ID: # ${ptd._id}`);

    // Check state of productDetails in Redux store
    const productDetailsState = store.getState().productDetails;

    expect(productDetailsState.product).toEqual(ptd);
    expect(productDetailsState.loading).toBe(false);
    expect(productDetailsState.error).toBe(null);
  });

  it("should display success message on successfull put review", async () => {
    // Render ProductDetails component
    const { store } = render(<ProductDetails />, {
      initialState,
      route: `/product/${ptd._id}`,
    });

    // Assert that "Your review has been posted." message is present
    expect(
      screen.getByText("Your review has been posted.")
    ).toBeInTheDocument();

    // Check state of newReview slice in Redux store
    const newReviewState = store.getState().newReview;

    expect(newReviewState.success).toBe(true);
    expect(newReviewState.loading).toBe(false);
    expect(newReviewState.error).toBe(null);

    // Wait 500ms for message to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of newReview slice in Redux store
    const newReviewState2 = store.getState().newReview;
    expect(newReviewState2.success).toBe(false);
  });

  it("should test mouse events on image", async () => {
    // Render ProductDetails component
    render(<ProductDetails />, {
      initialState: {
        productDetails: {
          product: ptd,
        },
      },
      route: `/product/${ptd._id}`,
    });

    // Get the first image from carousel
    const img = screen.getByAltText("Product Image 0");

    // Simulate mouse movement over image
    fireEvent.mouseEnter(img);
    fireEvent.mouseMove(img);
    fireEvent.mouseLeave(img);
  });

  it("should display isDeleted message on successfull delete review", async () => {
    // Render ProductDetails component
    const { store } = render(<ProductDetails />, {
      initialState,
      route: `/product/${ptd._id}`,
    });

    // Assert that "Review Deleted successfully!" message is present
    expect(
      screen.getByText("Review Deleted successfully!")
    ).toBeInTheDocument();

    // Check state of deleteReview slice in Redux store
    const deleteReviewState = store.getState().deleteReview;

    expect(deleteReviewState.isDeleted).toBe(true);
    expect(deleteReviewState.loading).toBe(false);
    expect(deleteReviewState.error).toBe(null);

    // Wait 500ms for message to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of deleteReview slice in Redux store
    const deleteReviewState2 = store.getState().deleteReview;
    expect(deleteReviewState2.isDeleted).toBe(false);
  });

  it("should interact with quantity, add to cart and carousel buttons", async () => {
    // Render ProductDetails component
    const { store } = render(<ProductDetails />, {
      route: `/product/${ptd._id}`,
    });

    // Assert that Product with this id is present
    await screen.findByText(`ID: # ${ptd._id}`);

    // Get the '‹' and '›' buttons associated with the first image
    const prevButton = screen.getAllByLabelText("‹")[0];
    const nextButton = screen.getAllByLabelText("›")[0];

    // Simulate click event on the '›' button
    fireEvent.click(nextButton);

    // Simulate click event on the '‹' button
    fireEvent.click(prevButton);

    // Simulate quantity change
    const qtyInput = screen.getByLabelText("Quantity");
    fireEvent.change(qtyInput, { value: 2 });

    // Simulate add to cart
    const addToCartButton = screen.getByRole("button", { name: "Add To Cart" });
    fireEvent.click(addToCartButton);

    // Check state of productDetails in Redux store
    const productDetailsState = store.getState().productDetails;

    expect(productDetailsState.product).toEqual(ptd);
    expect(productDetailsState.loading).toBe(false);
    expect(productDetailsState.error).toBe(null);
  });

  it("should return an error if product is not found", async () => {
    // Render ProductDetails component
    const { store } = render(<ProductDetails />, {
      route: `/product/656e87ad3303f371f28eed99`,
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

    // Wait for loading to end
    await act(async () => {
      store.getState().productDetails.loading === false;
    });

    // Wait for the "Product not found" message to appear
    await waitFor(() => {
      expect(screen.getByText("Product not found")).toBeInTheDocument();
    });

    // Check state of productDetails slice in Redux store
    const productDetailsState = store.getState().productDetails;

    expect(productDetailsState.product).toStrictEqual({});
    expect(productDetailsState.loading).toBe(false);
    expect(productDetailsState.error).toBe("Product not found");

    // Wait 500ms for success state to be reset
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of productDetails slice in Redux store
    const productDetailsState2 = store.getState().productDetails;

    expect(productDetailsState2.error).toBe(null);
  });

  it("should add new item to cart", async () => {
    const { store } = render(<ProductDetails />, {
      route: `/product/${ptd._id}`,
    });

    // Set input quantity to 1
    const inputQty = screen.getByLabelText("Quantity");
    fireEvent.change(inputQty, { value: 1 });

    // Simulate add to cart
    const addToCartButton = screen.getByRole("button", { name: "Add To Cart" });
    fireEvent.click(addToCartButton);

    // wait for quantity change to be updated in redux store
    await act(async () => {
      store.getState().cart.cartItems.quantity === 1;
    });

    // Set input quantity to 3
    fireEvent.change(inputQty, { value: 3 });

    // Simulate add to cart
    fireEvent.click(addToCartButton);

    // wait for quantity change to be updated in redux store
    await act(async () => {
      store.getState().cart.cartItems.quantity === 3;
    });
  });

  it("should return an error if ", async () => {
    // Render ProductDetails component
    const { store } = render(<ProductDetails />, {
      route: `/product/${ptd._id}`,
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

    // Set quantity input to 1
    const inputQty = screen.getByLabelText("Quantity");
    fireEvent.change(inputQty, { value: 1 });

    // Simulate add to cart
    const addToCartButton = screen.getByRole("button", { name: "Add To Cart" });
    fireEvent.click(addToCartButton);

    // Wait for the "Product not found" message to appear
    await waitFor(() => {
      expect(screen.getByText("Product not found")).toBeInTheDocument();
    });

    // Check state of cart slice in Redux store
    const cartState = store.getState().cart;

    expect(cartState.cartItems).toStrictEqual([]);
    expect(cartState.error).toBe("Product not found");
  });
});
