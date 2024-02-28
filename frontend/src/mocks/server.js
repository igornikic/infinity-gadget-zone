import { setupServer } from "msw/node";
import * as authHandlers from "./handlers/user/authHandler";
import * as userHandlers from "./handlers/user/userHandler";
import * as passwordHandlers from "./handlers/password/passwordHandler";
import * as shopAuthHandlers from "./handlers/shop/shopAuthHandler";
import * as shopHandlers from "./handlers/shop/shopHandler";
import * as productHandlers from "./handlers/product/productHandler";
import * as cartHandlers from "./handlers/cart/cartHandler";

// Combine all handlers into array
const allHandlers = [
  ...Object.values(authHandlers),
  ...Object.values(userHandlers),
  ...Object.values(passwordHandlers),
  ...Object.values(shopAuthHandlers),
  ...Object.values(shopHandlers),
  ...Object.values(productHandlers),
  ...Object.values(cartHandlers),
];

export const server = setupServer(...allHandlers);
