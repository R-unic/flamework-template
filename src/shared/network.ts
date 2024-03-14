import { Networking } from "@flamework/networking";
import type{ DataValue } from "./data-models/generic";
import type { GitHubInfo } from "./structs/github";

interface ServerEvents {
  data: {
    initialize(): void;
    set(directory: string, value: DataValue): void;
    increment(directory: string, amount?: number): void;
  };
}

interface ClientEvents {
  data: {
    updated(directory: string, value: DataValue): void;
  };
}

interface ServerFunctions {
  data: {
    get(directory: string): DataValue;
  };
  github: {
    getInfo(): GitHubInfo;
  };
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
