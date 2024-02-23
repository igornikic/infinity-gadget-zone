import React from "react";
import { rest } from "msw";

import ProductReviews from "./ProductReviews";

import { render, screen, fireEvent, act } from "../utils/test-utils.jsx";
import { server } from "../../mocks/server.js";
import { userTestData as utd } from "../../test-data/user/userTestData.js";
import { productTestData as ptd } from "../../test-data/product/productTestData.js";

// Define the initial state for the Redux store
const initialState = {
  auth: {
    isAuthenticated: true,
    user: utd,
    loading: false,
    error: null,
  },
  productDetails: {
    product: ptd,
    loading: false,
    error: null,
  },
};

describe("GET /reviews", () => {
  it("should delte product review", async () => {
    // Render ProductReviews component
    const { store } = render(
      <ProductReviews productId={ptd._id} reviews={ptd.reviews} />,
      {
        initialState,
      }
    );

    const deleteButton = screen.getByRole("button");
    fireEvent.click(deleteButton);

    // Check state of productReviews slice in Redux store
    const productReviewsState = store.getState().productReviews;

    expect(productReviewsState.reviews).toStrictEqual([]);
    expect(productReviewsState.loading).toBe(false);
    expect(productReviewsState.error).toBe(null);
  });

  it("should should return an error if delete product review fails", async () => {
    // Render ProductReviews component
    const { store } = render(
      <ProductReviews productId={ptd._id} reviews={ptd.reviews} />,
      {
        initialState,
      }
    );

    // Mock server to respond with an error when delete review request is made
    server.use(
      rest.delete(`/api/reviews`, (req, res, ctx) => {
        return res(
          ctx.status(404),
          ctx.json({
            isDeleted: false,
            message: "Review not found",
          })
        );
      })
    );

    // Assert that "Other's Reviews" heading is present
    expect(
      screen.getByText(`Other's Reviews: ${ptd.reviews.length} reviews`)
    ).toBeInTheDocument();

    const deleteButton = screen.getByRole("button");
    fireEvent.click(deleteButton);

    // Wait for loading to end
    await act(async () => {
      store.getState().deleteReview.loading === false;
    });

    // Check state of deleteReview slice in Redux store
    const deleteReviewState = store.getState().deleteReview;
    expect(deleteReviewState.isDeleted).toBe(false);
    expect(deleteReviewState.loading).toBe(false);
    expect(deleteReviewState.error).toBe("Review not found");

    // Wait 500ms for message to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of deleteReview slice in Redux store
    const deleteReviewState2 = store.getState().deleteReview;
    expect(deleteReviewState2.error).toBe(null);
  });
});
