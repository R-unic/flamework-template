import { Service } from "@flamework/core";

import { Events } from "server/network";
import { Replicator } from "shared/classes/replicable";

@Service()
export class AudioService extends Replicator<Parameters<typeof Events.audio.replicate.predict>> {

}