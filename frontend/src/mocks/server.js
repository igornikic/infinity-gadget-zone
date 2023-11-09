import { setupServer } from "msw/node";
import * as authHandlers from "./handlers/user/authHandler";
import * as userHandlers from "./handlers/user/userHandler";

// Combine all handlers into array
const allHandlers = [
  ...Object.values(authHandlers),
  ...Object.values(userHandlers),
];

export const server = setupServer(...allHandlers);
