import { GlobalEvents, GlobalFunctions } from "shared/network";
import PaktMiddleware from "shared/pakt/middleware";

export const Events = GlobalEvents.createServer({
  middleware: {
    encoded: {
      test: [PaktMiddleware.events()]
    }
  }
});
export const Functions = GlobalFunctions.createServer({
  middleware: {

  }
});
