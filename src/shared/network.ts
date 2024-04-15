import { Networking } from "@flamework/networking";
import type { GitHubInfo } from "./structs/github";

interface ServerEvents {
  data: {
    initialize(): void;
    set(directory: string, value: unknown): void;
    increment(directory: string, amount?: number): void;
  };
  character: {
    toggleDefaultMovement(on: boolean): void;
  };
}

interface ClientEvents {
  data: {
    updated(directory: string, value: unknown): void;
  };
}

interface ServerFunctions {
  data: {
    get(directory: string): unknown;
  };
  github: {
    getInfo(): GitHubInfo;
  };
}

interface ClientFunctions { }

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
