import { Controller, Modding, type OnStart } from "@flamework/core";
import Object from "@rbxts/object-utils";

import type { OnDataUpdate } from "client/hooks";
import { Events, Functions } from "client/network";
import { Player } from "shared/utility/client";
import { getDirectoryForPlayer, INITIAL_DATA, type PlayerData } from "shared/data-models/player-data";

@Controller({ loadOrder: -1000 })
export class DataUpdateController implements OnStart {
  public async onStart(): Promise<void> {
    const dataUpdateListeners = new Set<OnDataUpdate>;
    Modding.onListenerAdded<OnDataUpdate>(object => dataUpdateListeners.add(object));
    Modding.onListenerRemoved<OnDataUpdate>(object => dataUpdateListeners.delete(object));

    Events.data.loaded.connect(async () => {
      const data = <PlayerData>await Functions.data.get("", INITIAL_DATA);
      for (const key of Object.keys(INITIAL_DATA))
        for (const listener of dataUpdateListeners)
          listener.onDataUpdate(getDirectoryForPlayer(Player, key), data[key]);
    });
    Events.data.updated.connect((directory, value) => {
      for (const listener of dataUpdateListeners)
        listener.onDataUpdate(directory, value);
    });
  }
}