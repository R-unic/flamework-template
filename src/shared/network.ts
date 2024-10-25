import { Networking } from "@flamework/networking";

import type { GitHubInfo } from "./structs/github";

interface ServerEvents {
  data: {
    initialize(): void;
    set(directory: string, value: unknown): void;
    increment(directory: string, amount?: number): void;
    decrement(directory: string, amount?: number): void;
    addToArray(directory: string, value: defined): void;
  };
  character: {
    toggleDefaultMovement(on: boolean): void;
  };
}

interface ClientEvents {
  data: {
    loaded(): void;
    updated(directory: string, value: unknown): void;
  };
}

interface ServerFunctions {
  data: {
    get(directory: string, defaultValue?: unknown): unknown;
  };
  github: {
    getInfo(): GitHubInfo;
  };
}

interface ClientFunctions { }

type SerializeEvents<Events extends {}> = {
  [K in keyof Events]: Events[K] extends Callback ?
  (packet: SerializedPacket) => void
  : Events[K] extends {} ?
  SerializeEvents<Events[K]>
  : Events[K];
};

export const GlobalEvents = Networking.createEvent<SerializeEvents<ServerEvents>, SerializeEvents<ClientEvents>>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();