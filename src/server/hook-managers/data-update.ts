import { Service, Modding, type OnStart } from "@flamework/core";
import { DatabaseService } from "server/services/database";

import type { OnDataUpdate } from "shared/hooks";

@Service()
export class DataUpdateService implements OnStart {
  public constructor(
    private readonly database: DatabaseService
  ) {}

  public onStart(): void {
    const dataUpdateListeners = new Set<OnDataUpdate>;
    Modding.onListenerAdded<OnDataUpdate>(object => dataUpdateListeners.add(object));
    Modding.onListenerAdded<OnDataUpdate>(object => dataUpdateListeners.delete(object));

    this.database.updated.Connect((directory, value) => {
      for (const listener of dataUpdateListeners)
        listener.onDataUpdate(directory, value);
    });
  }
}