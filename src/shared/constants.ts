import { RunService as Runtime } from "@rbxts/services";
import Object from "@rbxts/object-utils";

enum DevID {
  Runic = 44966864
}

export const CREATOR_ID = DevID.Runic; // add your user ID here
export const DEVELOPERS = new Set(Object.values(DevID)); // add extra developer user IDs here

export function isDeveloper(player: Player): boolean {
  return Runtime.IsStudio() || DEVELOPERS.has(player.UserId);
}