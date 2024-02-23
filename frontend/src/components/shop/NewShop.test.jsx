import React from "react";
import { rest } from "msw";

import NewShop from "./NewShop.jsx";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "../utils/test-utils.jsx";
import { server } from "../../mocks/server.js";
import { shopTestData as std } from "../../test-data/shop/shopTestData.js";

describe("POST /shop/new", () => {
  it("should register new shop", async () => {
    // Render NewShop component
    const { store } = render(<NewShop />);

    // Assert that "Create Your Store" heading is present
    expect(screen.getByText("Create Your Store")).toBeInTheDocument();

    const testLogo = new File(["logo"], "logo.png", {
      type: "image/png",
    });

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      "Store Name": std.shopName,
      Email: std.shopEmail,
      Password: std.password,
      "Confirm Password": std.password,
      "Phone Number": std.phoneNumber,
      Address: std.address,
      "Zip Code": std.zipCode,
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Simulate file input change for Store Logo field
    const logoInput = screen.getByLabelText("Store Logo");
    fireEvent.change(logoInput, { target: { files: [testLogo] } });

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
    const submitButton = screen.getByRole("button", { name: "Create Store" });
    fireEvent.submit(submitButton);

    // Wait for loading to end
    await act(async () => {
      store.getState().shopAuth.loading === false;
    });

    // Wait for the "Email sent to: emailAddress" message to appear
    await waitFor(() => {
      expect(
        screen.getByText(`Email sent to: ${std.shopEmail}`)
      ).toBeInTheDocument();
    });

    // Check state of shopAuth slice in Redux store
    const shopAuthState = store.getState().shopAuth;

    expect(shopAuthState.shop).toStrictEqual({});
    expect(shopAuthState.loading).toBe(false);
    expect(shopAuthState.isSeller).toBe(false);
    expect(shopAuthState.message).toBe(`Email sent to: ${std.shopEmail}`);
    expect(shopAuthState.error).toBe(null);

    // Wait 500ms for success message to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of auth slice in Redux store
    const shopAuthState2 = store.getState().shopAuth;

    expect(shopAuthState2.message).toBe("");
  });

  it("should return an error if passwords do not match", async () => {
    // Render NewShop component
    const { store } = render(<NewShop />);

    // Assert that "Create Your Store" heading is present
    expect(screen.getByText("Create Your Store")).toBeInTheDocument();

    const testLogo = new File(["logo"], "logo.png", {
      type: "image/png",
    });

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      "Store Name": std.shopName,
      Email: std.shopEmail,
      Password: "12345678",
      "Confirm Password": "123456789",
      "Phone Number": std.phoneNumber,
      Address: std.address,
      "Zip Code": std.zipCode,
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Simulate file input change for Store Logo field
    const logoInput = screen.getByLabelText("Store Logo");
    fireEvent.change(logoInput, { target: { files: [testLogo] } });

    // Mock server to respond with an error when shop registration request is made
    server.use(
      rest.post("/api/shop/new", (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ message: "Passwords do not match" })
        );
      })
    );

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: "Create Store" });
    fireEvent.submit(submitButton);

    // Wait for loading to end
    await act(async () => {
      store.getState().shopAuth.loading === false;
    });
    // Wait for the "Passwords do not match" message to appear
    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });

    // Check state of shopAuth slice in Redux store
    const shopAuthState = store.getState().shopAuth;

    expect(shopAuthState.shop).toBe(null);
    expect(shopAuthState.loading).toBe(false);
    expect(shopAuthState.isSeller).toBe(false);
    expect(shopAuthState.message).toBe("");
    expect(shopAuthState.error).toBe("Passwords do not match");

    // Wait 500ms for error to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of auth slice in Redux store
    const shopAuthState2 = store.getState().shopAuth;

    expect(shopAuthState2.error).toBe(null);
  });
});
