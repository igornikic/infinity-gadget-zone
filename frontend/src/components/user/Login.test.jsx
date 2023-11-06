import React from "react";
import { rest } from "msw";

import Login from "./Login";
import { render, screen, fireEvent, act } from "../utils/test-utils.jsx";
import { server } from "../../mocks/server.js";
import { userTestData as utd } from "../../test-data/user/userTestData.js";

describe("POST /login", () => {
  it("should login user and return a token", async () => {
    // Render Login component
    const { store } = render(<Login />);

    // Assert that "Login" heading is present
    const loginHeading = screen.getByRole("heading", { name: "Login" });
    expect(loginHeading).toBeInTheDocument();

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      Email: utd.email,
      Password: utd.password,
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: "Login" });
    fireEvent.click(submitButton);

    // Wait for the "Logged Successfully!" message to appear
    await screen.findByText("Logged Successfully!");

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

    // Check state of auth slice in Redux store
    const authState = store.getState().auth;

    expect(authState.user.username).toBe(utd.username);
    expect(authState.loading).toBe(false);
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.error).toBe(null);

    // Wait 2s before redirect occurs
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    expect(window.location.pathname).toBe("/");
  });

  it("should return an error if email or password is incorrect", async () => {
    // Render Login component
    const { store } = render(<Login />);

    // Assert that "Login" heading is present
    const loginHeading = screen.getByRole("heading", { name: "Login" });
    expect(loginHeading).toBeInTheDocument();

    const inputFields = {
      Email: utd.email,
      Password: "12345678",
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Mock server to respond with an error when login request is made
    server.use(
      rest.post("/api/login", (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({ message: "Invalid Email or Password" })
        );
      })
    );

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: "Login" });
    fireEvent.click(submitButton);

    // Wait for the "Invalid Email or Password" message to appear
    await screen.findByText("Invalid Email or Password");

    // Assert the success message is displayed
    expect(screen.getByText("Invalid Email or Password")).toBeInTheDocument();

    // Check state of auth slice in Redux store
    const authState = store.getState().auth;

    expect(authState.user).toBe(null);
    expect(authState.loading).toBe(false);
    expect(authState.isAuthenticated).toBe(false);
    expect(authState.error).toBe("Invalid Email or Password");

    // Wait 5s for error to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });

    // Check state of auth slice in Redux store
    const authState2 = store.getState().auth;

    expect(authState2.error).toBe(null);
  });
});
