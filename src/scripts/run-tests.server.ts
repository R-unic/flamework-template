import { ServerScriptService } from "@rbxts/services";

import { TestRunner } from "shared/runit";

TestRunner.run([
  ServerScriptService.WaitForChild("Tests")
]);