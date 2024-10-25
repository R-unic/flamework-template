import { Service, Modding, type OnStart } from "@flamework/core";

import type { OnDataLoad, OnDataUpdate } from "server/hooks";

import type { DataService } from "server/services/third-party/data";

@Service({ loadOrder: 1000 })
export class DataUpdateService implements OnStart {
  public constructor(
    private readonly database: DataService
  ) { }

  public async onStart(): Promise<void> {
    const dataLoadListeners = new Set<OnDataLoad>;
    const dataUpdateListeners = new Set<OnDataUpdate>;
    Modding.onListenerAdded<OnDataLoad>(object => dataLoadListeners.add(object));
    Modding.onListenerRemoved<OnDataLoad>(object => dataLoadListeners.delete(object));
    Modding.onListenerAdded<OnDataUpdate>(object => dataUpdateListeners.add(object));
    Modding.onListenerRemoved<OnDataUpdate>(object => dataUpdateListeners.delete(object));

    this.database.loaded.Connect((player, data) => {
      for (const listener of dataLoadListeners)
        listener.onDataLoad(player, data);
      for (const listener of dataUpdateListeners)
        listener.onDataUpdate(player, data);
    });
    this.database.updated.Connect((player, data) => {
      for (const listener of dataUpdateListeners)
        listener.onDataUpdate(player, data);
    });
  }
}