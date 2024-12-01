import { Networking } from "@flamework/networking";
import { createBinarySerializer } from "@rbxts/flamework-binary-serializer";

import type { PlayerData } from "./data-models/player-data";
import type { AudioPacket } from "./structs/packets";
import type { ReplicationOptions } from "./classes/replicable";

type SerializedRemote = (packet: SerializedPacket) => void;
type UnreliableSerializedRemote = Networking.Unreliable<(packet: SerializedPacket) => void>;

interface ServerEvents {
  useReplicationOptions(options: ReplicationOptions): void;
  audio: {
    replicate: SerializedRemote;
  };
  data: {
    initialize(): void;
  };
  character: {
    toggleDefaultMovement(on: boolean): void;
  };
}

interface ClientEvents {
  audio: {
    played: SerializedRemote;
  };
  data: {
    loaded: SerializedRemote;
    updated: SerializedRemote;
  };
}

interface ServerFunctions { }

interface ClientFunctions { }

export const Serializers = {
  playerData: createBinarySerializer<PlayerData>(),
  audio: createBinarySerializer<AudioPacket>()
};

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();