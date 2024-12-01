import { Service } from "@flamework/core";

import { Events } from "server/network";
import { SerializedReplicator } from "shared/classes/replicable";

@Service()
export class AudioService extends SerializedReplicator {
  public constructor() {
    super(Events.audio.replicate, Events.audio.played);
  }
}