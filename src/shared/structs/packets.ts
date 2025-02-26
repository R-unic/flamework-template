import type { PacketSafePlaySoundOptions } from "./audio";

export interface AudioPacket {
  readonly sound: Sound;
  readonly options?: PacketSafePlaySoundOptions;
}