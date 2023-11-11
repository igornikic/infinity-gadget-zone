import React from "react";
import { rest } from "msw";

import Header from "./Header";
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

describe("GET /logout", () => {
  it("should logout user", async () => {
    // Render Header component with the defined initial state
    const { store } = render(<Header />, { initialState });

    // Simulate avatar click
    const avatar = screen.getByAltText("Avatar");
    fireEvent.click(avatar);

    // Simulate logout click
    const logout = screen.getByText("Logout");
    fireEvent.click(logout);

    // Wait for the "Logged Out Successfully" message to appear
    await screen.findByText("Logged Out Successfully");

    // Check state of auth slice in Redux store
    const authState = store.getState().auth;
    console.log(authState);

    expect(authState.user).toBe(null);
    expect(authState.loading).toBe(false);
    expect(authState.isAuthenticated).toBe(false);
    expect(authState.error).toBe(null);
  });

  it("should return an error if logout fail", async () => {
    // Render Header component with the defined initial state
    const { store } = render(<Header />, { initialState });

    // Mock server to respond with an error when logout request is made
    server.use(
      rest.get("/api/logout", (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: "Logout failed" }));
      })
    );

    // Simulate avatar click
    const avatar = screen.getByAltText("Avatar");
    fireEvent.click(avatar);

    // Simulate logout click
    const logout = screen.getByText("Logout");
    fireEvent.click(logout);

    // Wait for the "Logout failed" message to appear
    await screen.findByText("Logout failed");

    // Assert the success message is displayed
    expect(screen.getByText("Logout failed")).toBeInTheDocument();

    // Check state of auth slice in Redux store
    const authState = store.getState().auth;

    expect(authState.error).toBe("Logout failed");

    // Wait 5s for error to be cleared
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });

    // Check state of auth slice in Redux store
    const authState2 = store.getState().auth;

    expect(authState2.error).toBe(null);
  });
});

describe("Header component tests", () => {
  it("should open/close dropdowns", async () => {
    // Render Header component with the defined initial state
    render(<Header />, { initialState });
    // Simulate avatar click
    const avatar = screen.getByAltText("Avatar");
    fireEvent.click(avatar);

    // Simulate search click
    const submitButton = screen.getByRole("button", { type: "submit" });
    fireEvent.click(submitButton);

    // Simulate hamburger dropdown click
    const hamburger = screen.getByTestId("hamburger-icon");
    fireEvent.click(hamburger);
  });

  it("should display register and login links when user is not authorized", async () => {
    // Render Header component
    render(<Header />);
    // Simulate profile click
    const profile = screen.getByTitle("Profile");
    fireEvent.click(profile);

    // Check dropdown links
    const registerLink = screen.getByText("Register");
    expect(registerLink).toBeInTheDocument();
    const loginLink = screen.getByText("Login");
    expect(loginLink).toBeInTheDocument();
  });

  it("should display dashboard, profile and logout links when autorized as admin", async () => {
    // Render Header component with the defined initial state
    render(<Header />, {
      initialState: {
        auth: {
          user: {
            ...utd,
            role: "admin",
          },
        },
      },
    });

    // Simulate profile click
    const profile = screen.getByTitle("Profile");
    fireEvent.click(profile);

    // Check dropdown links
    const dashboardLink = screen.getByText("Dashboard");
    expect(dashboardLink).toBeInTheDocument();
    const profileLink = screen.getByText("Profile");
    expect(profileLink).toBeInTheDocument();
    const logoutLink = screen.getByText("Logout");
    expect(logoutLink).toBeInTheDocument();
  });
});
