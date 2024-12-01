import type { PlaySoundOptions } from "./audio";

export interface AudioPacket {
  readonly sound: Sound;
  readonly options?: Omit<PlaySoundOptions, "createContainerPart"> & { createContainerPart?: boolean; };
}