import React from "react";
import Search from "./Search";
import { render, screen, fireEvent, act } from "../utils/test-utils.jsx";

describe("Search component tests", () => {
  it("should display products related to search query", async () => {
    // Render Search component
    render(<Search />);

    // Navigate to search page with keyword appended to URL path
    const search = screen.getByPlaceholderText("Search...");
    fireEvent.change(search, { target: { value: "Laptop" } });
    // Simulate search submit
    const submitButton = screen.getByRole("button", { type: "submit" });
    fireEvent.click(submitButton);

    expect(window.location.pathname).toBe("/search/Laptop");
  });

  it("should navigate to home page if keyword is empty", async () => {
    // Render Search component
    render(<Search />);

    // Navigate to home on empty input enter
    const search = screen.getByPlaceholderText("Search...");
    fireEvent.change(search, { target: { value: "" } });
    // Simulate search submit
    const submitButton = screen.getByRole("button", { type: "submit" });
    fireEvent.click(submitButton);

    expect(window.location.pathname).toBe("/");
  });
});
