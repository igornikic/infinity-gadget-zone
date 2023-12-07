import React from "react";
import { rest } from "msw";

import NewPassword from "./NewPassword.jsx";
import { render, screen, fireEvent, act } from "../utils/test-utils.jsx";
import { server } from "../../mocks/server.js";

describe("PUT /password/reset/:token", () => {
  it("should set new password for user account", async () => {
    // Render NewPassword component
    const { store } = render(<NewPassword />, {
      route: "/password/reset/7372bc1599f6bf2b5e6ab5284a13692dc169e201",
    });

    // Assert that "New Password" heading is present
    const newPasswordHeading = screen.getByRole("heading", {
      name: "New Password",
    });
    expect(newPasswordHeading).toBeInTheDocument();

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      "New Password": "sickPassword123!",
      "Confirm New Password": "sickPassword123!",
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
    const submitButton = screen.getByRole("button", {
      name: "Set Password",
    });
    fireEvent.click(submitButton);

    // Wait for the "New Password Set Successfully" message to appear
    await screen.findByText("New Password Set Successfully");

    // Check state of forgotPassword slice in Redux store
    const forgotPasswordState = store.getState().forgotPassword;

    expect(forgotPasswordState.loading).toBe(false);
    expect(forgotPasswordState.success).toBe(true);
    expect(forgotPasswordState.error).toBe(null);

    // Wait 2s before redirect occurs
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    expect(window.location.pathname).toBe("/login");
  });

  it("should return an error if token have expired", async () => {
    // Render NewPassword component
    const { store } = render(<NewPassword />, {
      route: "/password/reset/7372bc1599f6bf2b5e6ab5284a13692dc169e201",
    });

    // Assert that "New Password" heading is present
    const newPasswordHeading = screen.getByRole("heading", {
      name: "New Password",
    });
    expect(newPasswordHeading).toBeInTheDocument();

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      "New Password": "sickPassword123!",
      "Confirm New Password": "sickPassword123!",
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Mock server to respond with an error when reset password request is made
    server.use(
      rest.put("/api/password/reset/:token", (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            message: "Password reset token is invalid or has been expired",
          })
        );
      })
    );

    // Simulate form submission
    const submitButton = screen.getByRole("button", {
      name: "Set Password",
    });
    fireEvent.click(submitButton);

    // Wait for the "Password reset token is invalid or has been expired" message to appear
    await screen.findByText(
      "Password reset token is invalid or has been expired"
    );

    // Check state of forgotPassword slice in Redux store
    const forgotPasswordState = store.getState().forgotPassword;

    expect(forgotPasswordState.loading).toBe(false);
    expect(forgotPasswordState.success).toBe(false);
    expect(forgotPasswordState.error).toBe(
      "Password reset token is invalid or has been expired"
    );

    // Wait 5s for error to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });

    // Check state of forgotPassword slice in Redux store
    const forgotPasswordState2 = store.getState().forgotPassword;

    expect(forgotPasswordState2.error).toBe(null);
  });
});

describe("PUT /shop/password/reset/:token", () => {
  it("should set new password for user account", async () => {
    // Render NewPassword component
    const { store } = render(<NewPassword />, {
      route: "/shop/password/reset/7372bc1599f6bf2b5e6ab5284a13692dc169e201",
    });

    // Assert that "New Password" heading is present
    const newPasswordHeading = screen.getByRole("heading", {
      name: "New Password",
    });
    expect(newPasswordHeading).toBeInTheDocument();

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      "New Password": "sickPassword123!",
      "Confirm New Password": "sickPassword123!",
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
    const submitButton = screen.getByRole("button", {
      name: "Set Password",
    });
    fireEvent.click(submitButton);

    // Wait for the "New Password Set Successfully" message to appear
    await screen.findByText("New Password Set Successfully");

    // Check state of forgotPassword slice in Redux store
    const forgotPasswordState = store.getState().forgotPassword;

    expect(forgotPasswordState.loading).toBe(false);
    expect(forgotPasswordState.success).toBe(true);
    expect(forgotPasswordState.error).toBe(null);

    // Wait 2s before redirect occurs
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    expect(window.location.pathname).toBe("/login");
  });

  it("should return an error if token have expired", async () => {
    // Render NewPassword component
    const { store } = render(<NewPassword />, {
      route: "/shop/password/reset/7372bc1599f6bf2b5e6ab5284a13692dc169e201",
    });

    // Assert that "New Password" heading is present
    const newPasswordHeading = screen.getByRole("heading", {
      name: "New Password",
    });
    expect(newPasswordHeading).toBeInTheDocument();

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      "New Password": "sickPassword123!",
      "Confirm New Password": "sickPassword123!",
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Mock server to respond with an error when reset password request is made
    server.use(
      rest.put("/api/shop/password/reset/:token", (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            message: "Password reset token is invalid or has been expired",
          })
        );
      })
    );

    // Simulate form submission
    const submitButton = screen.getByRole("button", {
      name: "Set Password",
    });
    fireEvent.click(submitButton);

    // Wait for the "Password reset token is invalid or has been expired" message to appear
    await screen.findByText(
      "Password reset token is invalid or has been expired"
    );

    // Check state of forgotPassword slice in Redux store
    const forgotPasswordState = store.getState().forgotPassword;

    expect(forgotPasswordState.loading).toBe(false);
    expect(forgotPasswordState.success).toBe(false);
    expect(forgotPasswordState.error).toBe(
      "Password reset token is invalid or has been expired"
    );

    // Wait 5s for error to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });

    // Check state of forgotPassword slice in Redux store
    const forgotPasswordState2 = store.getState().forgotPassword;

    expect(forgotPasswordState2.error).toBe(null);
  });
});
