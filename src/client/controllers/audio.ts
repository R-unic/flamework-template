import { Controller } from "@flamework/core";

import { Events } from "client/network";
import { Replicable } from "shared/classes/replicable";

@Controller()
export class AudioController extends Replicable<Parameters<typeof Events.audio.played.predict>> {
  public constructor() {
    super(Events.audio.played, Events.audio.replicate);
  }

  public play(sound: Sound, parent?: Instance): void {
    this.requestReplication(sound, parent);
  }

  protected replicate(sound: Sound, parent?: Instance): void {
    sound = sound.Clone();
    sound.Parent = parent;
    sound.Ended.Once(() => sound.Destroy());
    sound.Play();
  }
}