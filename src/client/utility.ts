import { Players } from "@rbxts/services";

export const Player = Players.LocalPlayer;
export const PlayerGui = Player.WaitForChild<PlayerGui>("PlayerGui");