import { ReplicatedFirst, RunService as Runtime } from "@rbxts/services";
import Object from "@rbxts/object-utils";
import Signal from "@rbxts/signal";

enum DevID {
  Runic = 44966864
}

const DEVELOPERS = new Set(Object.values(DevID)); // add extra developer user IDs here

export function isDeveloper(player: Player): boolean {
  return Runtime.IsStudio() || DEVELOPERS.has(player.UserId);
}

export const Assets = ReplicatedFirst.Assets;

export const FlameworkIgnited = new Signal;