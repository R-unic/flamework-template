import { Networking } from "@flamework/networking";
import type { GitHubInfo } from "./structs/github";
import type { GamepassInfo } from "./structs/roblox-api";

interface ServerEvents {
  encoded: {
    test(message: string, n: number, isCool: boolean): void;
  };
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
  character: {
    toggleCustomMovement(on: boolean): void;
  };
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
  roblox: {
    getGamepasses(amount?: number): GamepassInfo[];
  };
}

interface ClientFunctions { }

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
