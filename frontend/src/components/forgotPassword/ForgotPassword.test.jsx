import React from "react";
import { rest } from "msw";

import ForgotPassword from "./ForgotPassword";
import { render, screen, fireEvent, act } from "../utils/test-utils.jsx";
import { server } from "../../mocks/server.js";

describe("POST /password/forgot", () => {
  it("should request password reset email", async () => {
    // Render ForgotPassword component
    const { store } = render(<ForgotPassword />, {
      route: "/password/forgot",
    });

    // Assert that "Forgot Password" heading is present
    const forgotPasswordHeading = screen.getByRole("heading", {
      name: "Forgot Password",
    });
    expect(forgotPasswordHeading).toBeInTheDocument();

    // Simulate email input
    const input = screen.getByLabelText("Email");
    fireEvent.change(input, { target: { value: "test@gmail.com" } });

    // Simulate form submission
    const submitButton = screen.getByRole("button", {
      name: "Send Email",
    });
    fireEvent.click(submitButton);

    // Wait for the "Email sent to: test@gmail.com" message to appear
    await screen.findByText("Email sent to: test@gmail.com");

    // Check state of forgotPassword slice in Redux store
    const forgotPasswordState = store.getState().forgotPassword;

    expect(forgotPasswordState.loading).toBe(false);
    expect(forgotPasswordState.message).toBe("Email sent to: test@gmail.com");
    expect(forgotPasswordState.email).toBe("test@gmail.com");
    expect(forgotPasswordState.error).toBe(null);

    // Wait 5s for message to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });

    // Check state of forgotPassword slice in Redux store
    const forgotPasswordState2 = store.getState().forgotPassword;

    expect(forgotPasswordState2.message).toBe("");
  });

  it("should return an error if email is not found", async () => {
    // Render ForgotPassword component
    const { store } = render(<ForgotPassword />, {
      route: "/password/forgot",
    });

    // Assert that "Forgot Password" heading is present
    const forgotPasswordHeading = screen.getByRole("heading", {
      name: "Forgot Password",
    });
    expect(forgotPasswordHeading).toBeInTheDocument();

    // Simulate email input
    const input = screen.getByLabelText("Email");
    fireEvent.change(input, { target: { value: "test@gmail.com" } });

    // Mock server to respond with an error when forgot password request is made
    server.use(
      rest.post("/api/password/forgot", (req, res, ctx) => {
        return res(
          ctx.status(404),
          ctx.json({
            message: "User not found with this email",
          })
        );
      })
    );

    // Simulate form submission
    const submitButton = screen.getByRole("button", {
      name: "Send Email",
    });
    fireEvent.click(submitButton);

    // Wait for the "User not found with this email" message to appear
    await screen.findByText("User not found with this email");

    // Check state of forgotPassword slice in Redux store
    const forgotPasswordState = store.getState().forgotPassword;

    expect(forgotPasswordState.loading).toBe(false);
    expect(forgotPasswordState.message).toBe("");
    expect(forgotPasswordState.email).toBe("");
    expect(forgotPasswordState.error).toBe("User not found with this email");

    // Wait 5s for error to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });

    // Check state of forgotPassword slice in Redux store
    const forgotPasswordState2 = store.getState().forgotPassword;

    expect(forgotPasswordState2.error).toBe(null);
  });
});

describe("POST /shop/password/forgot", () => {
  it("should request password reset email", async () => {
    // Render ForgotPassword component
    const { store } = render(<ForgotPassword />, {
      route: "/shop/password/forgot",
    });

    // Assert that "Forgot Password" heading is present
    const forgotPasswordHeading = screen.getByRole("heading", {
      name: "Forgot Password",
    });
    expect(forgotPasswordHeading).toBeInTheDocument();

    // Simulate email input
    const input = screen.getByLabelText("Email");
    fireEvent.change(input, { target: { value: "test@gmail.com" } });

    // Simulate form submission
    const submitButton = screen.getByRole("button", {
      name: "Send Email",
    });
    fireEvent.click(submitButton);

    // Wait for the "Email sent to: test@gmail.com" message to appear
    await screen.findByText("Email sent to: test@gmail.com");

    // Check state of forgotPassword slice in Redux store
    const forgotPasswordState = store.getState().forgotPassword;

    expect(forgotPasswordState.loading).toBe(false);
    expect(forgotPasswordState.message).toBe("Email sent to: test@gmail.com");
    expect(forgotPasswordState.email).toBe("test@gmail.com");
    expect(forgotPasswordState.error).toBe(null);

    // Wait 5s for message to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });

    // Check state of forgotPassword slice in Redux store
    const forgotPasswordState2 = store.getState().forgotPassword;

    expect(forgotPasswordState2.message).toBe("");
  });

  it("should return an error if email is not found", async () => {
    // Render ForgotPassword component
    const { store } = render(<ForgotPassword />, {
      route: "/shop/password/forgot",
    });

    // Assert that "Forgot Password" heading is present
    const forgotPasswordHeading = screen.getByRole("heading", {
      name: "Forgot Password",
    });
    expect(forgotPasswordHeading).toBeInTheDocument();

    // Simulate email input
    const input = screen.getByLabelText("Email");
    fireEvent.change(input, { target: { value: "test@gmail.com" } });

    // Mock server to respond with an error when forgot password request is made
    server.use(
      rest.post("/api/shop/password/forgot", (req, res, ctx) => {
        return res(
          ctx.status(404),
          ctx.json({
            message: "Shop not found with this email",
          })
        );
      })
    );

    // Simulate form submission
    const submitButton = screen.getByRole("button", {
      name: "Send Email",
    });
    fireEvent.click(submitButton);

    // Wait for the "Shop not found with this email" message to appear
    await screen.findByText("Shop not found with this email");

    // Check state of forgotPassword slice in Redux store
    const forgotPasswordState = store.getState().forgotPassword;

    expect(forgotPasswordState.loading).toBe(false);
    expect(forgotPasswordState.message).toBe("");
    expect(forgotPasswordState.email).toBe("");
    expect(forgotPasswordState.error).toBe("Shop not found with this email");

    // Wait 5s for error to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });

    // Check state of forgotPassword slice in Redux store
    const forgotPasswordState2 = store.getState().forgotPassword;

    expect(forgotPasswordState2.error).toBe(null);
  });
});
