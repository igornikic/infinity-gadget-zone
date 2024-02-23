import React from "react";
import { rest } from "msw";

import NewProduct from "./NewProduct";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "../utils/test-utils.jsx";
import { server } from "../../mocks/server.js";
import { productTestData as ptd } from "../../test-data/product/productTestData.js";
import { shopTestData as std } from "../../test-data/shop/shopTestData.js";

// Define the initial state for the Redux store
const initialState = {
  shopAuth: {
    shop: std,
    loading: false,
    isSeller: true,
    message: "",
    error: null,
  },
};

describe("POST /product/new", () => {
  it("should create new product", async () => {
    // Render NewProduct component
    const { store } = render(<NewProduct />, { initialState });

    // Assert that "Create Product" heading is present
    const createProductHeading = screen.getByRole("heading", {
      name: "Create Product",
    });
    expect(createProductHeading).toBeInTheDocument();

    const testProduct = new File(["product"], "product.png", {
      type: "image/png",
    });

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      "Product Name": ptd.name,
      "Product Price": ptd.price,
      "Product Stock": ptd.stock,
      Description: ptd.description,
      "Product Category": ptd.category,
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Simulate file input change for Product Images field and add 2 images
    const productImageInput = screen.getByLabelText("Product Images");
    fireEvent.change(productImageInput, {
      target: { files: [testProduct, testProduct] },
    });

    // Wait for the '‹' and '›' buttons to become visible after image upload
    await waitFor(() => {
      const prevButtons = screen.getAllByLabelText("‹");
      const nextButtons = screen.getAllByLabelText("›");
      expect(prevButtons.length).toBeGreaterThanOrEqual(1);
      expect(nextButtons.length).toBeGreaterThanOrEqual(1);
    });

    // Get the '‹' and '›' buttons associated with the first image
    const prevButton = screen.getAllByLabelText("‹")[0];
    const nextButton = screen.getAllByLabelText("›")[0];

    // Simulate click event on the '›' button
    fireEvent.click(nextButton);

    // Simulate click event on the '‹' button
    fireEvent.click(prevButton);

    // Get the 'X' button associated with the first image
    await waitFor(() => {
      const removeButtons = screen.getAllByRole("button", { name: "X" });
      expect(removeButtons.length).toBeGreaterThanOrEqual(1);
    });

    const removeImageButton = screen.getAllByRole("button", { name: "X" })[0];

    // Simulate image removing on the 'X' button
    fireEvent.click(removeImageButton);

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: "Create Product" });
    fireEvent.submit(submitButton);

    // Wait for loading to end
    await act(async () => {
      store.getState().newProduct.loading === false;
    });

    // Wait for the "Product Created Successfully!" message to appear
    await waitFor(() => {
      expect(
        screen.getByText("Product Created Successfully!")
      ).toBeInTheDocument();
    });

    // Check state of newProduct slice in Redux store
    const newProductState = store.getState().newProduct;

    expect(newProductState.product.name).toBe(ptd.name);
    expect(newProductState.loading).toBe(false);
    expect(newProductState.success).toBe(true);
    expect(newProductState.error).toBe(null);

    // Wait 500ms for success state to be reset
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of newProduct slice in Redux store
    const newProductState2 = store.getState().newProduct;

    expect(newProductState2.success).toBe(false);
  });

  it("should test '‹' , '›' and remove image buttons", async () => {
    // Render NewProduct component
    render(<NewProduct />, { initialState });

    // Assert that "Create Product" heading is present
    const createProductHeading = screen.getByRole("heading", {
      name: "Create Product",
    });
    expect(createProductHeading).toBeInTheDocument();

    const testProduct = new File(["product"], "product.png", {
      type: "image/png",
    });

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      "Product Name": ptd.name,
      "Product Price": ptd.price,
      "Product Stock": ptd.stock,
      Description: ptd.description,
      "Product Category": ptd.category,
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Simulate file input change for Product Images field and add 3 images
    const productImageInput = screen.getByLabelText("Product Images");
    fireEvent.change(productImageInput, {
      target: { files: [testProduct, testProduct, testProduct] },
    });

    // Wait for the '‹' and '›' buttons to become visible after image upload
    await waitFor(() => {
      const prevButtons = screen.getAllByLabelText("‹");
      const nextButtons = screen.getAllByLabelText("›");
      expect(prevButtons.length).toBeGreaterThanOrEqual(1);
      expect(nextButtons.length).toBeGreaterThanOrEqual(1);
    });

    // Get the '‹' and '›' buttons associated with the first image
    const prevButton = screen.getAllByLabelText("‹")[2];
    const nextButton = screen.getAllByLabelText("›")[2];

    // Simulate click event on the '›' button
    fireEvent.click(nextButton);

    // Simulate click event on the '‹' button
    fireEvent.click(prevButton);

    // Get the 'X' button associated with the first image
    await waitFor(() => {
      const removeButtons = screen.getAllByRole("button", { name: "X" });
      expect(removeButtons.length).toBeGreaterThanOrEqual(1);
    });

    // Simulate image removing on the 'X' button
    const removeImageButton = screen.getAllByRole("button", { name: "X" })[2];
    fireEvent.click(removeImageButton);

    // Get the '‹' and '›' buttons associated with the first image
    const prevButton2 = screen.getAllByLabelText("‹")[1];
    const nextButton2 = screen.getAllByLabelText("›")[1];

    // Simulate click event on the '›' button
    fireEvent.click(nextButton2);

    // Simulate click event on the '‹' button
    fireEvent.click(prevButton2);

    // Simulate image removing on the 'X' button
    const removeImageButton2 = screen.getAllByRole("button", { name: "X" })[1];
    fireEvent.click(removeImageButton2);

    // Simulate image removing on the 'X' button
    const removeImageButton3 = screen.getAllByRole("button", { name: "X" })[0];
    fireEvent.click(removeImageButton3);
  });

  it("should return an error if name is shorter than 3 characters", async () => {
    // Render NewProduct component
    const { store } = render(<NewProduct />, { initialState });

    // Assert that "Create Product" heading is present
    const createProductHeading = screen.getByRole("heading", {
      name: "Create Product",
    });
    expect(createProductHeading).toBeInTheDocument();

    const testProduct = new File(["product"], "product.png", {
      type: "image/png",
    });

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      "Product Name": "PR",
      "Product Price": ptd.price,
      "Product Stock": ptd.stock,
      Description: ptd.description,
      "Product Category": ptd.category,
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Simulate file input change for Product Images field
    const productImageInput = screen.getByLabelText("Product Images");
    fireEvent.change(productImageInput, {
      target: { files: [testProduct, testProduct] },
    });

    // Mock server to respond with an error when registration request is made
    server.use(
      rest.post("/api/product/new", (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            message: "Product name must be between 3 and 100 characters long",
          })
        );
      })
    );

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: "Create Product" });
    fireEvent.submit(submitButton);

    // Wait for the "Product name must be between 3 and 100 characters long" message to appear
    await waitFor(() => {
      expect(
        screen.getByText(
          "Product name must be between 3 and 100 characters long"
        )
      ).toBeInTheDocument();
    });

    // Check state of newProduct slice in Redux store
    const newProductState = store.getState().newProduct;

    expect(newProductState.product).toStrictEqual({});
    expect(newProductState.loading).toBe(false);
    expect(newProductState.success).toBe(false);
    expect(newProductState.error).toBe(
      "Product name must be between 3 and 100 characters long"
    );

    // Wait 500ms for error to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of newProduct slice in Redux store
    const newProductState2 = store.getState().newProduct;

    expect(newProductState2.error).toBe(null);
  });
});
