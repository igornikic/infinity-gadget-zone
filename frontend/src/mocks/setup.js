import { server } from "./server";
import "@testing-library/jest-dom";

// Start mock server
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Reset mock server handlers between tests
afterEach(() => server.resetHandlers());

// Close mock server after all tests are finished
afterAll(() => server.close());
