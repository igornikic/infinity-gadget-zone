import React from "react";
import Search from "./Search";
import { render, screen, fireEvent } from "../utils/test-utils.jsx";

describe("Search component tests", () => {
  it("should display products related to search query", async () => {
    // Render Search component
    render(<Search />);

    // Set search input value to keyword "Laptop"
    const search = screen.getByPlaceholderText("Search...");
    fireEvent.change(search, { target: { value: "Laptop" } });

    // Simulate search submit
    const submitButton = screen.getByRole("button", {
      type: "submit",
      name: "Search",
    });
    fireEvent.click(submitButton);

    expect(window.location.pathname).toBe("/search/Laptop");
  });

  it("should display shop products related to search query", async () => {
    // Render Search component
    render(<Search />, { route: "/products/shop/64d194ec5fb1cfaede33629b" });

    // Set search input value to keyword "Laptop"
    const search = screen.getByPlaceholderText("Search...");
    fireEvent.change(search, { target: { value: "Laptop" } });

    // Simulate search submit
    const submitButton = screen.getByRole("button", {
      type: "submit",
      name: "Search",
    });
    fireEvent.click(submitButton);

    expect(window.location.pathname).toBe(
      "/products/shop/64d194ec5fb1cfaede33629b/Laptop"
    );
  });

  it("should navigate to home page if keyword is empty", async () => {
    // Render Search component
    render(<Search />);

    // Set search input value to ""
    const search = screen.getByPlaceholderText("Search...");
    fireEvent.change(search, { target: { value: "" } });

    // Simulate search submit
    const submitButton = screen.getByRole("button", {
      type: "submit",
      name: "Search",
    });
    fireEvent.click(submitButton);

    expect(window.location.pathname).toBe("/");
  });
});
