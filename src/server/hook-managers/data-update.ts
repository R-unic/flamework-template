import { Service, Modding, type OnStart } from "@flamework/core";

import type { OnDataUpdate } from "server/hooks";

import type { DatabaseService } from "server/services/third-party/database";

@Service()
export class DataUpdateService implements OnStart {
  public constructor(
    private readonly database: DatabaseService
  ) { }

  public onStart(): void {
    const dataUpdateListeners = new Set<OnDataUpdate>;
    Modding.onListenerAdded<OnDataUpdate>(object => dataUpdateListeners.add(object));
    Modding.onListenerRemoved<OnDataUpdate>(object => dataUpdateListeners.delete(object));

    this.database.updated.Connect((player, directory, value) => {
      for (const listener of dataUpdateListeners)
        listener.onDataUpdate(player, directory, value);
    });
  }
}