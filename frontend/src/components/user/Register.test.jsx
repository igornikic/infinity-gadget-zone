import React from "react";
import { rest } from "msw";

import Register from "./Register";
import { render, screen, fireEvent, act } from "../utils/test-utils.jsx";
import { server } from "../../mocks/server.js";
import { userTestData as utd } from "../../test-data/user/userTestData.js";

describe("POST /register", () => {
  it("should register user with default avatar", async () => {
    // Render Register component
    const { store } = render(<Register />);

    // Assert that "Create Your Account" heading is present
    expect(screen.getByText("Create Your Account")).toBeInTheDocument();

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      Username: utd.username,
      "First Name": utd.firstName,
      "Last Name": utd.lastName,
      Email: utd.email,
      Password: utd.password,
      "Confirm Password": utd.password,
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: "Register" });
    fireEvent.click(submitButton);

    // Wait for the "Registered Successfully!" message to appear
    await screen.findByText("Registered Successfully!");

    // Check state of auth slice in Redux store
    const authState = store.getState().auth;

    expect(authState.user.username).toBe(utd.username);
    expect(authState.loading).toBe(false);
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.error).toBe(null);
  });

  it("should register user with uploaded avatar", async () => {
    // Render Register component
    const { store } = render(<Register />);

    // Assert that "Create Your Account" heading is present
    expect(screen.getByText("Create Your Account")).toBeInTheDocument();

    const testAvatar = new File(["avatar"], "avatar.png", {
      type: "image/png",
    });

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      Username: utd.username,
      "First Name": utd.firstName,
      "Last Name": utd.lastName,
      Email: utd.email,
      Password: utd.password,
      "Confirm Password": utd.password,
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Simulate file input change for Avatar field
    const avatarInput = screen.getByLabelText("Avatar");
    fireEvent.change(avatarInput, { target: { files: [testAvatar] } });

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: "Register" });
    fireEvent.click(submitButton);

    // Wait for the "Registered Successfully!" message to appear
    await screen.findByText("Registered Successfully!");

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

    // Assert the success message is displayed
    expect(screen.getByText("Registered Successfully!")).toBeInTheDocument();

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

  it("should return an error if passwords do not match", async () => {
    // Render Register component
    const { store } = render(<Register />);

    // Assert that "Create Your Account" heading is present
    expect(screen.getByText("Create Your Account")).toBeInTheDocument();

    const inputFields = {
      Username: utd.username,
      "First Name": utd.firstName,
      "Last Name": utd.lastName,
      Email: utd.email,
      Password: "12345678",
      "Confirm Password": "123456789",
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Mock server to respond with an error when registration request is made
    server.use(
      rest.post("/api/register", (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ message: "Passwords do not match" })
        );
      })
    );

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: "Register" });
    fireEvent.click(submitButton);

    // Wait for the "Passwords do not match" message to appear
    await screen.findByText("Passwords do not match");

    // Assert the error message is displayed
    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();

    // Check state of auth slice in Redux store
    const authState = store.getState().auth;

    expect(authState.user).toBe(null);
    expect(authState.loading).toBe(false);
    expect(authState.isAuthenticated).toBe(false);
    expect(authState.error).toBe("Passwords do not match");

    // Wait 5s for error to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });

    // Check state of auth slice in Redux store
    const authState2 = store.getState().auth;

    expect(authState2.error).toBe(null);
  });
});
