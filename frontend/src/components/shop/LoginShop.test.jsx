import React from "react";
import { rest } from "msw";

import LoginShop from "./LoginShop";
import { render, screen, fireEvent, act } from "../utils/test-utils.jsx";
import { server } from "../../mocks/server.js";
import { shopTestData as std } from "../../test-data/shop/shopTestData.js";

describe("POST /shop/login", () => {
  it("should login seller and return a token", async () => {
    // Render LoginShop component
    const { store } = render(<LoginShop />);

    // Assert that "Store Login" heading is present
    const loginHeading = screen.getByRole("heading", { name: "Store Login" });
    expect(loginHeading).toBeInTheDocument();

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      Email: std.shopEmail,
      Password: std.password,
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Simulate toggle password visibility
    const showPassword = screen.getAllByLabelText("Show Password");

    // Click each show password button
    showPassword.forEach((button) => {
      fireEvent.click(button);
    });

    const hidePassword = screen.getAllByLabelText("Hide Password");

    // Click each hide password button
    hidePassword.forEach((button) => {
      fireEvent.click(button);
    });

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: "Enter Store" });
    fireEvent.click(submitButton);

    // Wait for the "Successfully logged in. Happy selling!" message to appear
    await screen.findByText("Successfully logged in. Happy selling!");

    // Check state of shopAuth slice in Redux store
    const shopAuthState = store.getState().shopAuth;

    expect(shopAuthState.shop.shopName).toBe(std.shopName);
    expect(shopAuthState.loading).toBe(false);
    expect(shopAuthState.isSeller).toBe(true);
    expect(shopAuthState.message).toBe("");
    expect(shopAuthState.error).toBe(null);

    // Wait 2s before redirect occurs
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    expect(window.location.pathname).toBe("/shop/me");
  });

  it("should return an error if email or password is incorrect", async () => {
    // Render LoginShop component
    const { store } = render(<LoginShop />);

    // Assert that "Store Login" heading is present
    const loginHeading = screen.getByRole("heading", { name: "Store Login" });
    expect(loginHeading).toBeInTheDocument();

    const inputFields = {
      Email: std.shopEmail,
      Password: "123456",
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Mock server to respond with an error when shop login request is made
    server.use(
      rest.post("/api/shop/login", (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({ message: "Invalid Email or Password" })
        );
      })
    );

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: "Enter Store" });
    fireEvent.click(submitButton);

    // Wait for the "Invalid Email or Password" message to appear
    await screen.findByText("Invalid Email or Password");

    // Assert the error message is displayed
    expect(screen.getByText("Invalid Email or Password")).toBeInTheDocument();

    // Check state of shopAuth slice in Redux store
    const shopAuthState = store.getState().shopAuth;

    expect(shopAuthState.shop).toBe(null);
    expect(shopAuthState.loading).toBe(false);
    expect(shopAuthState.isSeller).toBe(false);
    expect(shopAuthState.message).toBe("");
    expect(shopAuthState.error).toBe("Invalid Email or Password");

    // Wait 500ms for error to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of shopAuth slice in Redux store
    const shopAuthState2 = store.getState().shopAuth;

    expect(shopAuthState2.error).toBe(null);
  });
});
