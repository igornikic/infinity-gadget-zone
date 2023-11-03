import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { render as rtlRender } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import rootReducer from "../../store/rootReducer";

// Custom render function for testing React components
function render(ui, { route = "/", initialState = {} } = {}) {
  window.history.pushState({}, "Test page", route);

  // Configure Redux store
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
  });

  const Wrapper = ({ children }) => {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  };

  // Render the UI component within wrapper
  return {
    ...rtlRender(ui, { wrapper: Wrapper }),
    store, // Return store
  };
}

// re-export everything
export * from "@testing-library/react";
// override render method
export { render };
