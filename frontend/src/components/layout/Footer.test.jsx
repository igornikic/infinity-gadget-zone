import React from "react";

import Footer from "./Footer";
import { render } from "../utils/test-utils.jsx";

describe("Footer", () => {
  it("should render footer component", async () => {
    // Render Footer component
    render(<Footer />);
  });
});
