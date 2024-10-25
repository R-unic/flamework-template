import type { PlayerData } from "shared/data-models/player-data";

export interface DataUpdatePacket {
  readonly directory: string;
  readonly value: unknown;
}

export interface PlayerDataPacket {
  readonly data: PlayerData;
}