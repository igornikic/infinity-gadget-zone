import React from "react";
import { rest } from "msw";

import GetProducts from "./GetProducts";
import ProductCard from "./ProductCard.jsx";

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
  products: {
    products: [ptd],
  },
};

describe("GET /products", () => {
  it("should get products", async () => {
    // Render GetProducts component with initial state
    render(<GetProducts />, { initialState });

    // Change the value of the input labeled "Category"
    const input = screen.getByLabelText("Category:");
    fireEvent.change(input, { value: "Fashion" });

    // Click the button to remove all filters
    const removeFilters = screen.getByRole("button", {
      name: "Remove All Filters",
    });
    fireEvent.click(removeFilters);

    // Click on an element with the title "4"
    fireEvent.click(screen.getByTitle("4"));

    // Change the value of the input labeled "Min Price"
    const minPrice = screen.getByLabelText("Min Price:");
    fireEvent.change(minPrice, { target: { value: 0 } });

    // Change the value of the input labeled "Max Price"
    const maxPrice = screen.getByLabelText("Max Price:");
    fireEvent.change(maxPrice, { target: { value: 100_000_000 } });

    // Check if the value of the "Min Price" input is set to "0" and "Max Price" input is set to "100000000"
    expect(minPrice.value).toBe("0");
    expect(maxPrice.value).toBe("100000000");

    // Change the value of the "Min Price" input to "10" and check if it has been updated
    fireEvent.change(minPrice, { target: { value: 10 } });
    expect(minPrice.value).toBe("10");
  });

  it("should get products", async () => {
    // Render ProductCard component
    render(<ProductCard product={ptd} />);
  });

  it("should should return an error if products are not found", async () => {
    // Render GetProducts component
    const { store } = render(<GetProducts />);

    // Mock server to respond with an error when get products request is made
    server.use(
      rest.get(`/api/products`, (req, res, ctx) => {
        return res(
          ctx.status(404),
          ctx.json({
            success: false,
            message: "Not found",
          })
        );
      })
    );

    const filters = screen.getByText("Filters");
    fireEvent.click(filters);

    // Wait for loading to end
    await act(async () => {
      store.getState().products.loading === false;
    });

    // Wait for the "Not found" message to appear
    await waitFor(() => {
      expect(screen.getByText("Not found")).toBeInTheDocument();
    });

    // Check state of products slice in Redux store
    const productsState = store.getState().products;
    expect(productsState.loading).toBe(false);
    expect(productsState.error).toBe("Not found");

    // Wait 500ms for message to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of products slice in Redux store
    const productsState2 = store.getState().products;
    expect(productsState2.error).toBe(null);
  });
});
