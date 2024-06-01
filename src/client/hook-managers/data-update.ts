import { Controller, Modding, type OnStart } from "@flamework/core";

import type { OnDataUpdate } from "client/hooks";
import { Events } from "client/network";

@Controller({ loadOrder: 999 })
export class DataUpdateController implements OnStart {
  public onStart(): void {
    const dataUpdateListeners = new Set<OnDataUpdate>;
    Modding.onListenerAdded<OnDataUpdate>(object => dataUpdateListeners.add(object));
    Modding.onListenerRemoved<OnDataUpdate>(object => dataUpdateListeners.delete(object));

    Events.data.updated.connect((directory, value) => {
      for (const listener of dataUpdateListeners)
        listener.onDataUpdate(directory, value);
    });
  }
}