import { Networking } from "@flamework/networking";
import { createBinarySerializer } from "@rbxts/flamework-binary-serializer";

import type { PlayerData } from "./data-models/player-data";

type SerializedCallback = (packet: SerializedPacket) => void;

interface ServerEvents {
  audio: {
    replicate(sound: Sound, parent?: Instance): void
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
    played(sound: Sound, parent?: Instance): void
  };
  data: {
    loaded: SerializedCallback;
    updated: SerializedCallback;
  };
}

interface ServerFunctions { }

interface ClientFunctions { }

export const Serializers = {
  playerData: createBinarySerializer<PlayerData>()
};

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();