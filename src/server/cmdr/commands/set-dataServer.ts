import { Firebase } from "@rbxts/firebase";
import type { CommandContext } from "@rbxts/cmdr";

import { getFirebaseInfo } from "server/services/third-party/data";

export = async function (context: CommandContext, directory: string, value: unknown): Promise<void> {
  try {
    const firebase = new Firebase(...await getFirebaseInfo());
    firebase.set(directory, value);
    context.Reply(`Successfully set data at "${directory}" to "${value}"!`, Color3.fromRGB(0, 255, 0));
  } catch (err) {
    context.Reply(`Error: ${err}`, Color3.fromRGB(255, 0, 0));
  }
}