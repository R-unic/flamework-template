import { TestRunner } from "@rbxts/runit";
import { ServerScriptService } from "@rbxts/services";

const testRunner = new TestRunner(
  ServerScriptService.WaitForChild("Tests")
);

testRunner.run({ colors: true });