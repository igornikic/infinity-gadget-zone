import React from "react";
import { rest } from "msw";

import UpdatePassword from "./UpdatePassword";
import { render, screen, fireEvent, act } from "../utils/test-utils.jsx";
import { server } from "../../mocks/server.js";
import { userTestData as utd } from "../../test-data/user/userTestData.js";

// Define the initial state for the Redux store
const initialState = {
  auth: {
    isAuthenticated: true,
    user: utd,
    loading: false,
    error: null,
  },
};

describe("PUT /password/update", () => {
  it("should update user password", async () => {
    // Render UpdatePassword component
    const { store } = render(<UpdatePassword />, { initialState });

    // Assert that "Update Password" heading is present
    const updatePasswordHeading = screen.getByRole("heading", {
      name: "Update Password",
    });
    expect(updatePasswordHeading).toBeInTheDocument();

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      "Old Password": "sickPassword!",
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
      name: "Update Password",
    });
    fireEvent.click(submitButton);

    // Wait for the "Password Changed Successfully!" message to appear
    await screen.findByText("Password Changed Successfully!");

    // Check state of user slice in Redux store
    const userState = store.getState().user;

    expect(userState.loading).toBe(false);
    expect(userState.isUpdated).toBe(true);
    expect(userState.isDeleted).toBe(false);
    expect(userState.error).toBe(null);

    // Wait 5s for isUpdated to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });

    // Check state of user slice in Redux store
    const userState2 = store.getState().user;

    expect(userState2.isUpdated).toBe(false);
  });

  it("should return an error if update password fail", async () => {
    // Render UpdatePassword component
    const { store } = render(<UpdatePassword />, { initialState });

    // Assert that "Update Password" heading is present
    const updatePasswordHeading = screen.getByRole("heading", {
      name: "Update Password",
    });
    expect(updatePasswordHeading).toBeInTheDocument();

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      "Old Password": "sickPassword!",
      "New Password": "sickPassword123!",
      "Confirm New Password": "sickPassword1234!",
    };

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Mock server to respond with an error when update password request is made
    server.use(
      rest.put("/api/password/update", (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            message: "Password and Confirm Password do not match",
          })
        );
      })
    );

    // Simulate form submission
    const submitButton = screen.getByRole("button", {
      name: "Update Password",
    });
    fireEvent.click(submitButton);

    // Wait for the error message to appear
    await screen.findByText("Password and Confirm Password do not match");

    // Check state of user slice in Redux store
    const userState = store.getState().user;

    expect(userState.isUpdated).toBe(false);
    expect(userState.error).toBe("Password and Confirm Password do not match");

    // Wait 5s for error to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });

    // Check state of user slice in Redux store
    const userState2 = store.getState().user;

    expect(userState2.error).toBe(null);
  });
});
