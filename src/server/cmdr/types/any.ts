import type { Registry } from "@rbxts/cmdr";

import { isNaN } from "shared/utility/numbers";

export = function (registry: Registry): void {
  registry.RegisterType("any", {
    Parse: value => {
      if (tonumber(value) !== undefined && !isNaN(tonumber(value)!))
        return tonumber(value)!;
      else if (value === "true")
        return true;
      else if (value === "false")
        return false;
      else if (["undefined", "null", "nil"].includes(<string>value))
        return undefined;
      else
        return value;
    }
  })
}