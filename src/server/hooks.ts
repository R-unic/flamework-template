import { PlayerData } from "shared/data-models/player-data";

export interface OnPlayerLeave {
  onPlayerLeave(player: Player): void;
}

export interface OnPlayerJoin {
  onPlayerJoin(player: Player): void;
}

export interface OnDataUpdate {
  onDataUpdate(player: Player, data: PlayerData): void;
}

export interface OnDataLoad {
  onDataLoad(player: Player, data: PlayerData): void;
}