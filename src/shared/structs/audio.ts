interface BasePlaySoundOptions {
  readonly parent?: Instance;
}

export type PlaySoundOptions = BasePlaySoundOptions & ({
  readonly createContainerPart: true;
  readonly position: Vector3;
} | {
  readonly createContainerPart?: false;
  readonly position?: undefined;
});