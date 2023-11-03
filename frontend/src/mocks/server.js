import { setupServer } from "msw/node";
import * as authHandlers from "./handlers/user/authHandler";

// Combine all handlers into array
const allHandlers = [...Object.values(authHandlers)];

export const server = setupServer(...allHandlers);
