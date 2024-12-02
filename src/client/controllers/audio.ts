import { Controller } from "@flamework/core";
import { Workspace as World, SoundService as Sound } from "@rbxts/services";

import { Events } from "client/network";
import { ReplicationOptions, SerializedReplicable } from "shared/classes/replicable";
import { Serializers } from "shared/network";
import { PlaySoundOptions } from "shared/structs/audio";
import type { AudioPacket } from "shared/structs/packets";

@Controller()
export class AudioController extends SerializedReplicable<AudioPacket> {
  public constructor() {
    super(Events.audio.played, Events.audio.replicate, Serializers.audio);
  }

  public play(sound: Sound, options?: PlaySoundOptions, replicationOptions?: ReplicationOptions): void {
    this.requestReplication({ sound, options }, replicationOptions);
  }

  public playNoReplication(sound: Sound, options?: PlaySoundOptions): void {
    this.replicate({ sound, options });
  }

  protected replicate({ sound: soundTemplate, options }: AudioPacket): void {
    const sound = soundTemplate.Clone();
    const toDestroy: Instance[] = [sound];
    if (options?.createContainerPart ?? false) {
      if (options?.parent === undefined) {
        const ignore = new Instance("Folder");
        ignore.Name = "Ignore";
        ignore.Parent = World;
      }

      const container = new Instance("Part", options?.parent ?? World.FindFirstChild("Ignore"));
      container.Transparency = 1;
      container.Anchored = true;
      container.CanCollide = false;
      container.Size = Vector3.one;
      container.Position = options?.position!;
      sound.Parent = container;
      toDestroy.push(container);
    } else
      sound.Parent = options?.parent ?? Sound;

    sound.Ended.Once(() => toDestroy.forEach(i => i.Destroy()));
    sound.Play();
  }
}