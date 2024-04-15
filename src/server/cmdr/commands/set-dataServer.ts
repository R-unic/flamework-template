import type { CommandContext } from "@rbxts/cmdr";
import Firebase from "server/firebase";

export = function (context: CommandContext, directory: string, value: unknown): void {
  try {
    const firebase = new Firebase;
    firebase.set(directory, value);
    context.Reply(`Successfully set data at "${directory}" to "${value}"!`, Color3.fromRGB(0, 255, 0));
  } catch (err) {
    context.Reply(`Error: ${err}`, Color3.fromRGB(255, 0, 0));
  }
}