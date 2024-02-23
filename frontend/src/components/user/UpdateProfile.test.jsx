import React from "react";
import { rest } from "msw";

import UpdateProfile from "./UpdateProfile";
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

describe("PUT /me/update", () => {
  it("should update user profile", async () => {
    // Render UpdateProfile component
    const { store } = render(<UpdateProfile />, { initialState });

    // Assert that "Edit Profile" heading is present
    const editProfileHeading = screen.getByRole("heading", {
      name: "Edit Profile",
    });
    expect(editProfileHeading).toBeInTheDocument();

    // Define an object with input field labels and their corresponding values
    const inputFields = {
      Username: "Test",
      "First Name": "Johny",
      "Last Name": "Do",
      Email: "johnydo@gmail.com",
    };

    const testAvatar = new File(["avatar"], "avatar.png", {
      type: "image/png",
    });

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Simulate file input change for Avatar field
    const avatarInput = screen.getByLabelText("Avatar");
    fireEvent.change(avatarInput, { target: { files: [testAvatar] } });

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: "Update Profile" });
    fireEvent.click(submitButton);

    // Wait for the "Profile updated successfully" message to appear
    await screen.findByText("Profile updated successfully");

    // Check state of auth and user slice in Redux store
    const authState = store.getState().auth;
    const userState = store.getState().user;

    expect(authState.user.username).toBe("Test");
    expect(userState.loading).toBe(false);
    expect(userState.isUpdated).toBe(true);
    expect(userState.isDeleted).toBe(false);
    expect(userState.error).toBe(null);

    // Wait 500ms for isUpdated to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of user slice in Redux store
    const userState2 = store.getState().user;

    expect(userState2.isUpdated).toBe(false);
  });

  it("should return an error if update profile fail", async () => {
    // Render UpdateProfile component
    const { store } = render(<UpdateProfile />, { initialState });

    // Assert that "Edit Profile" heading is present
    const editProfileHeading = screen.getByRole("heading", {
      name: "Edit Profile",
    });
    expect(editProfileHeading).toBeInTheDocument();

    // Define an object with invalid data
    const inputFields = {
      Username: "T",
      "First Name": "Johny",
      "Last Name": "Do",
      Email: "johnydo@gmail.com",
    };

    const testAvatar = new File(["avatar"], "avatar.png", {
      type: "image/png",
    });

    // Set values for each input field based on the label
    for (const [label, value] of Object.entries(inputFields)) {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
    }

    // Simulate file input change for Avatar field
    const avatarInput = screen.getByLabelText("Avatar");
    fireEvent.change(avatarInput, { target: { files: [testAvatar] } });

    // Mock server to respond with an error when update profile request is made
    server.use(
      rest.put("/api/me/update", (req, res, ctx) => {
        return res(
          ctx.status(422),
          ctx.json({
            message:
              "Validation failed: firstName: Your first name must be at least 3 characters long",
          })
        );
      })
    );

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: "Update Profile" });
    fireEvent.click(submitButton);

    // Wait for the error message to appear
    await screen.findByText(
      "Validation failed: firstName: Your first name must be at least 3 characters long"
    );

    // Check state of auth and user slice in Redux store
    const authState = store.getState().auth;
    const userState = store.getState().user;

    expect(authState.user.username).toBe("Test");
    expect(userState.isUpdated).toBe(false);
    expect(userState.error).toBe(
      "Validation failed: firstName: Your first name must be at least 3 characters long"
    );

    // Wait 500ms for error to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Check state of user slice in Redux store
    const userState2 = store.getState().user;

    expect(userState2.error).toBe(null);
  });
});
