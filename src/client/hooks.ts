import type { PlayerData } from "shared/data-models/player-data";

export interface OnDataUpdate {
  onDataUpdate(data: PlayerData): void;
}

export interface OnDataLoad {
  onDataLoad(data: PlayerData): void;
}