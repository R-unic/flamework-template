import { Controller } from "@flamework/core";

import { Events } from "client/network";
import { SerializedReplicable } from "shared/classes/replicable";
import { Serializers } from "shared/network";
import { PlaySoundOptions } from "shared/structs/audio";
import type { AudioPacket } from "shared/structs/packets";

@Controller()
export class AudioController extends SerializedReplicable<AudioPacket> {
  public constructor() {
    super(Events.audio.played, Events.audio.replicate, Serializers.audio);
  }

  public play(sound: Sound, options?: PlaySoundOptions): void {
    this.requestReplication({ sound, options });
  }

  protected replicate({ sound, options }: AudioPacket): void {
    sound = sound.Clone();
    sound.Parent = options?.parent;
    sound.Ended.Once(() => sound.Destroy());
    sound.Play();
  }
}