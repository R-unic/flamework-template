import { TestBootstrap, Reporters } from "@rbxts/testez";
import { ServerScriptService } from "@rbxts/services";

TestBootstrap.run([ServerScriptService.WaitForChild("Tests")], Reporters.TextReporter);