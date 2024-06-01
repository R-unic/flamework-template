import { Service, type OnInit } from "@flamework/core";
import { HttpService as HTTP } from "@rbxts/services";
import { Functions } from "server/network";

import type { LogStart } from "shared/hooks";
import type { GamepassInfo } from "shared/structs/roblox-api";
import { HttpException } from "shared/exceptions";

interface GameApiError {
  readonly code: number;
  readonly message: string;
  readonly userFacingMessage: string;
}

interface ErrorBody {
  readonly errors: readonly GameApiError[];
}

interface SuccessBody<T> {
  readonly data: T[];
}

function didFail(body: object): body is ErrorBody {
  return "errors" in body;
}

@Service()
export class RobloxService implements OnInit, LogStart {
  private readonly gamepassesEndpoint = `https://games.roproxy.com/v1/games/${game.GameId}/game-passes?sortOrder=Asc&limit=100`;
  private cache?: GamepassInfo[];

  public onInit(): void {
    Functions.roblox.getGamepasses.setCallback(() => this.getGamepasses());
  }

  public async getGamepasses(): Promise<GamepassInfo[]> {
    try {
      if (this.cache === undefined) {
        const json = HTTP.GetAsync(this.gamepassesEndpoint);
        const body = <object>HTTP.JSONDecode(json);
        if (didFail(body)) {
          const [err] = body.errors;
          throw new HttpException(`Failed to fetch game gamepass info: ${err.userFacingMessage} - ${err.message}`);
        }

        const gamepasses = (<SuccessBody<GamepassInfo>>body).data;
        this.cache = gamepasses;
        return gamepasses;
      } else
        return this.cache;
    } catch (err) {
      throw new HttpException(<string>err);
    }
  }
}