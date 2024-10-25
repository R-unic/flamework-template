import { Networking } from "@flamework/networking";
import { createBinarySerializer } from "@rbxts/flamework-binary-serializer";
import { DataUpdatePacket, PlayerDataPacket } from "./structs/packets";

type SerializedCallback = (packet: SerializedPacket) => void;

interface ServerEvents {
  data: {
    initialize(): void;
  }
  character: {
    toggleDefaultMovement(on: boolean): void;
  };
}

interface ClientEvents {
  data: {
    loaded: SerializedCallback;
    updated: SerializedCallback;
  };
}

interface ServerFunctions { }

interface ClientFunctions { }

export const Serializers = {
  playerData: createBinarySerializer<PlayerDataPacket>()
};

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
