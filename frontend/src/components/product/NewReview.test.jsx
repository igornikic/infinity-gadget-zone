import React from "react";
import { rest } from "msw";

import NewReview from "./NewReview";

import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "../utils/test-utils.jsx";
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

describe("PUT /review", () => {
  it("should create new review", async () => {
    // Render NewReview component
    const { store } = render(<NewReview productId={ptd._id} />, {
      initialState,
    });

    // Assert that "Submit Your Review" heading is present
    expect(screen.getByText("Submit Your Review")).toBeInTheDocument();

    // Click the "Submit Your Review" button
    fireEvent.click(screen.getByText("Submit Your Review"));

    // Leave a comment
    fireEvent.change(screen.getByPlaceholderText("Write your review here..."), {
      target: { value: "Test review comment" },
    });

    // Rate with 5 stars
    fireEvent.click(screen.getByTitle("5"));

    // Simulate reivew submission
    const submitButton = screen.getByRole("button", {
      name: "Submit Review",
    });
    fireEvent.click(submitButton);

    // Wait for 'success' state to be true
    await waitFor(() => {
      const newReviewState = store.getState().newReview;
      return newReviewState.success === true;
    });

    // Check state of newReview slice in Redux store
    const newReviewState = store.getState().newReview;

    expect(newReviewState.success).toBe(true);
    expect(newReviewState.loading).toBe(false);
    expect(newReviewState.error).toBe(null);
  });

  it("should test modal closing", async () => {
    // Render NewReview component
    render(<NewReview productId={ptd._id} />, {
      initialState,
    });

    // Assert that "Submit Your Review" heading is present
    expect(screen.getByText("Submit Your Review")).toBeInTheDocument();

    // Click the "Submit Your Review" button
    fireEvent.click(screen.getByText("Submit Your Review"));

    // Mouse Down event on body element
    fireEvent.mouseDown(document.body);
  });

  it("should return an error if review creation fails", async () => {
    // Render NewReview component
    const { store } = render(
      <NewReview productId="656e87ad3303f371f28eed70" />,
      {
        initialState,
      }
    );

    // Assert that "Submit Your Review" heading is present
    expect(screen.getByText("Submit Your Review")).toBeInTheDocument();

    // Click the "Submit Your Review" button
    fireEvent.click(screen.getByText("Submit Your Review"));

    // Leave a comment
    fireEvent.change(screen.getByPlaceholderText("Write your review here..."), {
      target: { value: "Test review comment" },
    });

    // Rate with 5 stars
    fireEvent.click(screen.getByTitle("5"));

    // Mock server to respond with an error when new review request is made
    server.use(
      rest.put("/api/review", (req, res, ctx) => {
        return res(
          ctx.status(404),
          ctx.json({
            success: false,
            message: "Product not found with id: 656e87ad3303f371f28eed70",
          })
        );
      })
    );

    // Simulate reivew submission
    const submitButton = screen.getByRole("button", {
      name: "Submit Review",
    });
    fireEvent.click(submitButton);

    // Wait for "Product not found with id: 656e87ad3303f371f28eed70" message to appear
    await waitFor(() => {
      expect(
        screen.getByText("Product not found with id: 656e87ad3303f371f28eed70")
      ).toBeInTheDocument();
    });

    // Check state of newReview slice in Redux store
    const newReviewState = store.getState().newReview;

    expect(newReviewState.success).toBe(false);
    expect(newReviewState.loading).toBe(false);
    expect(newReviewState.error).toBe(
      "Product not found with id: 656e87ad3303f371f28eed70"
    );

    // Wait 500ms for error to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of newReview slice in Redux store
    const newReviewState2 = store.getState().newReview;

    expect(newReviewState2.error).toBe(null);
  });
});
