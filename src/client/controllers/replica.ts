import { Controller, type OnStart } from "@flamework/core";

import type { LogStart } from "shared/hooks";
import type { OnDataUpdate } from "client/hooks";
import { Events } from "client/network";
import { type PlayerData, INITIAL_DATA } from "shared/data-models/player-data";

@Controller({ loadOrder: 1000 })
export class ReplicaController implements OnStart, OnDataUpdate, LogStart {
  public readonly data: PlayerData = INITIAL_DATA;

  public onStart(): void {
    Events.data.initialize();
  }

  public onDataUpdate(this: Writable<ReplicaController>, data: PlayerData): void {
    this.data = data;
  }
}