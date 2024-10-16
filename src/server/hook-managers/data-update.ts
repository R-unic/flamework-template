import { Service, Modding, type OnStart } from "@flamework/core";
import Object from "@rbxts/object-utils";

import type { OnDataUpdate } from "server/hooks";
import { getDirectoryForPlayer, INITIAL_DATA } from "shared/data-models/player-data";

import type { DatabaseService } from "server/services/third-party/database";

@Service({ loadOrder: -1000 })
export class DataUpdateService implements OnStart {
  public constructor(
    private readonly database: DatabaseService
  ) { }

  public async onStart(): Promise<void> {
    const dataUpdateListeners = new Set<OnDataUpdate>;
    Modding.onListenerAdded<OnDataUpdate>(object => dataUpdateListeners.add(object));
    Modding.onListenerRemoved<OnDataUpdate>(object => dataUpdateListeners.delete(object));

    this.database.loaded.Connect(player => {
      const data = this.database.get(player, "", INITIAL_DATA);
      for (const key of Object.keys(INITIAL_DATA))
        for (const listener of dataUpdateListeners)
          listener.onDataUpdate(player, getDirectoryForPlayer(player, key), data[key]);
    });
    this.database.updated.Connect((player, directory, value) => {
      for (const listener of dataUpdateListeners)
        listener.onDataUpdate(player, directory, value);
    });
  }
}