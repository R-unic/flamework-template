interface BasePlaySoundOptions {
  readonly parent?: Instance;
}

export interface PacketSafePlaySoundOptions {
  readonly parent?: Instance;
  readonly createContainerPart?: boolean;
  readonly position?: Vector3;
}

export type PlaySoundOptions = BasePlaySoundOptions
  & ({
    readonly createContainerPart: true;
    readonly position: Vector3;
  } | {
    readonly createContainerPart?: false
    readonly position?: undefined;
  });