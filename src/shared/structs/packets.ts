import type { PlayerData } from "shared/data-models/player-data";

export interface PlayerDataPacket {
  readonly data: PlayerData;
}