import React from "react";
import { rest } from "msw";

import UpdateShop from "./UpdateShop";
import { render, screen, fireEvent, act } from "../utils/test-utils.jsx";
import { server } from "../../mocks/server.js";
import { shopTestData as std } from "../../test-data/shop/shopTestData.js";

// Define the initial state for the Redux store
const initialState = {
  shopAuth: {
    isAuthenticated: true,
    shop: std,
    loading: false,
    error: null,
  },
};

describe("PUT /me/update", () => {
  it("should update shop", async () => {
    // Render UpdateShop component
    const { store } = render(<UpdateShop />, { initialState });

    // Assert that "Update Shop" heading is present
    const updateShopHeading = screen.getByRole("heading", {
      name: "Update Shop",
    });
    expect(updateShopHeading).toBeInTheDocument();

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      "Shop Name": "Test Shop 2",
      Email: "testemail@gmail.com",
      "Phone Number": 12345678,
      Address: "USA, California, Los Angeles, 1 Main Street",
      "Zip Code": 1235,
    };

    const testLogo = new File(["logo"], "logo.png", {
      type: "image/png",
    });

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Simulate file input change for Logo field
    const logoInput = screen.getByLabelText("Logo");
    fireEvent.change(logoInput, { target: { files: [testLogo] } });

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: "Update Shop" });
    fireEvent.click(submitButton);

    // Wait for the "Shop updated successfully" message to appear
    await screen.findByText("Shop updated successfully");

    // Check state of shopAuth and shop slice in Redux store
    const shopAuthState = store.getState().shopAuth;
    const shopState = store.getState().shop;

    expect(shopAuthState.shop.shopName).toBe("Test Shop 2");
    expect(shopState.loading).toBe(false);
    expect(shopState.isUpdated).toBe(true);
    expect(shopState.isDeleted).toBe(false);
    expect(shopState.error).toBe(null);

    // Wait 500ms for isUpdated to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of shop slice in Redux store
    const shopState2 = store.getState().shop;

    expect(shopState2.isUpdated).toBe(false);
  });

  it("should return an error if update profile fail", async () => {
    // Render UpdateShop component
    const { store } = render(<UpdateShop />, { initialState });

    // Assert that "Update Shop" heading is present
    const updateShopHeading = screen.getByRole("heading", {
      name: "Update Shop",
    });
    expect(updateShopHeading).toBeInTheDocument();

    // Define an object with invalid data
    const inputFields = {
      "Shop Name": "T",
      Email: "testemail@gmail.com",
      "Phone Number": 12345678,
      Address: "USA, California, Los Angeles, 1 Main Street",
      "Zip Code": 1235,
    };

    const testLogo = new File(["logo"], "logo.png", {
      type: "image/png",
    });

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Simulate file input change for Logo field
    const logoInput = screen.getByLabelText("Logo");
    fireEvent.change(logoInput, { target: { files: [testLogo] } });

    // Mock server to respond with an error when update profile request is made
    server.use(
      rest.put("/api/shop/me/update", (req, res, ctx) => {
        return res(
          ctx.status(422),
          ctx.json({
            message:
              "Validation failed: shopName: Your shop name must be at least 3 characters long",
          })
        );
      })
    );

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: "Update Shop" });
    fireEvent.click(submitButton);

    // Wait for the error message to appear
    await screen.findByText(
      "Validation failed: shopName: Your shop name must be at least 3 characters long"
    );

    // Check state of shopAuth and shop slice in Redux store
    const shopAuthState = store.getState().shopAuth;
    const shopState = store.getState().shop;

    expect(shopAuthState.shop.shopName).toBe("Test Shop 2");
    expect(shopState.isUpdated).toBe(false);
    expect(shopState.error).toBe(
      "Validation failed: shopName: Your shop name must be at least 3 characters long"
    );

    // Wait 500ms for error to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of shop slice in Redux store
    const shopState2 = store.getState().shop;

    expect(shopState2.error).toBe(null);
  });
});
