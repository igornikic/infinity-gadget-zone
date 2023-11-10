import { setupServer } from "msw/node";
import * as authHandlers from "./handlers/user/authHandler";
import * as userHandlers from "./handlers/user/userHandler";
import * as passwordHandlers from "./handlers/user/passwordHandler";

// Combine all handlers into array
const allHandlers = [
  ...Object.values(authHandlers),
  ...Object.values(userHandlers),
  ...Object.values(passwordHandlers),
];

export const server = setupServer(...allHandlers);
