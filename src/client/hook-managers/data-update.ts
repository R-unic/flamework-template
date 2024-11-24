import { Controller, Modding, type OnStart } from "@flamework/core";

import type { OnDataLoad, OnDataUpdate } from "client/hooks";
import { Events } from "client/network";
import { Serializers } from "shared/network";

@Controller({ loadOrder: -1000 })
export class DataUpdateController implements OnStart {
  public async onStart(): Promise<void> {
    const dataLoadListeners = new Set<OnDataLoad>;
    const dataUpdateListeners = new Set<OnDataUpdate>;
    Modding.onListenerAdded<OnDataLoad>(object => dataLoadListeners.add(object));
    Modding.onListenerRemoved<OnDataLoad>(object => dataLoadListeners.delete(object));
    Modding.onListenerAdded<OnDataUpdate>(object => dataUpdateListeners.add(object));
    Modding.onListenerRemoved<OnDataUpdate>(object => dataUpdateListeners.delete(object));

    Events.data.loaded.connect(async ({ buffer, blobs }) => {
      const data = Serializers.playerData.deserialize(buffer, blobs);
      for (const listener of dataLoadListeners)
        listener.onDataLoad(data);
      for (const listener of dataUpdateListeners)
        listener.onDataUpdate(data);
    });
    Events.data.updated.connect(({ buffer, blobs }) => {
      const data = Serializers.playerData.deserialize(buffer, blobs);
      for (const listener of dataUpdateListeners)
        listener.onDataUpdate(data);
    });
  }
}