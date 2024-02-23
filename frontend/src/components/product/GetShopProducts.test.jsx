import React from "react";
import { rest } from "msw";

import GetShopProducts from "./GetShopProducts";

import { render, screen, fireEvent, act } from "../utils/test-utils.jsx";
import { server } from "../../mocks/server.js";

describe("GET /products/shop/:id", () => {
  it("should get shop products", async () => {
    // Render GetShopProducts component
    render(<GetShopProducts />);

    // Set category filter to Fashion
    const input = screen.getByLabelText("Category:");
    fireEvent.change(input, { value: "Fashion" });
  });

  it("should should return an error if shop products are not found", async () => {
    // Render GetShopProducts component
    const { store } = render(<GetShopProducts />, {
      route: "/products/shop/64d194ec5fb1cfaede33629b/Test",
    });

    // Mock server to respond with an error when get products request is made
    server.use(
      rest.get(`/api/products/shop/:id`, (req, res, ctx) => {
        return res(
          ctx.status(404),
          ctx.json({
            success: false,
            message: "Not found",
          })
        );
      })
    );

    // Wait for loading to end
    await act(async () => {
      store.getState().products.loading === false;
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
