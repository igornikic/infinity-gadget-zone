import React from "react";
import { rest } from "msw";

import ActivateShop from "./ActivateShop.jsx";
import { render, screen, fireEvent, act } from "../utils/test-utils.jsx";
import { server } from "../../mocks/server.js";
import { shopTestData as std } from "../../test-data/shop/shopTestData.js";

describe("PUT /shop/activate/:token", () => {
  it("should activate seller account", async () => {
    // Render ActivateShop component
    const { store } = render(<ActivateShop />, {
      route: "/shop/activate/7372bc1599f6bf2b5e6ab5284a13692dc169e201",
    });

    // Wait for the "Successfull activation. Happy selling!" message to appear
    await screen.findByText("Successfull activation. Happy selling!");

    // Assert that "Shop Activation Successful!" heading is present
    const activationHeading = screen.getByRole("heading", {
      name: "Shop Activation Successful!",
    });
    expect(activationHeading).toBeInTheDocument();

    // Check state of shopAuth slice in Redux store
    const shopAuthState = store.getState().shopAuth;

    expect(shopAuthState.shop.shopName).toBe(std.shopName);
    expect(shopAuthState.loading).toBe(false);
    expect(shopAuthState.isSeller).toBe(true);
    expect(shopAuthState.message).toBe("");
    expect(shopAuthState.error).toBe(null);

    // Simulate view store button click
    const viewStoreButton = screen.getByRole("button", {
      name: "View Store",
    });
    fireEvent.click(viewStoreButton);

    expect(window.location.pathname).toBe("/shop/me");
  });

  it("should return an error if token have expired", async () => {
    // Render ActivateShop component
    const { store } = render(<ActivateShop />, {
      route: "/shop/activate/7372bc1599f6bf2b5e6ab5284a13692dc169e201",
    });

    // Mock server to respond with an error when reset password request is made
    server.use(
      rest.put("/api/shop/activate/:token", (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            message: "Activation token is invalid or has expired",
          })
        );
      })
    );

    // Wait for the "Activation token is invalid or has expired" message to appear
    await screen.findByText("Activation token is invalid or has expired");

    // Assert that "Shop Activation Failed!" heading is present
    const activationHeading = screen.getByRole("heading", {
      name: "Shop Activation Failed!",
    });
    expect(activationHeading).toBeInTheDocument();

    // Check state of shopAuth slice in Redux store
    const shopAuthState = store.getState().shopAuth;

    expect(shopAuthState.shop).toBe(null);
    expect(shopAuthState.loading).toBe(false);
    expect(shopAuthState.isSeller).toBe(false);
    expect(shopAuthState.message).toBe("");
    expect(shopAuthState.error).toBe(
      "Activation token is invalid or has expired"
    );

    // Wait 5s for error to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });

    // Check state of shopAuth slice in Redux store
    const shopAuthState2 = store.getState().shopAuth;

    expect(shopAuthState2.error).toBe(null);

    // Simulate home button click
    const homeButton = screen.getByRole("button", {
      name: "Home",
    });
    fireEvent.click(homeButton);

    expect(window.location.pathname).toBe("/");
  });
});
