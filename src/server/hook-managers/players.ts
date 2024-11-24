import { Service, Modding, type OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";

import type { OnPlayerJoin, OnPlayerLeave } from "server/hooks";

@Service({ loadOrder: 1 })
export class PlayersService implements OnStart {
  public onStart(): void {
    const joinListeners = new Set<OnPlayerJoin>;
    const leaveListeners = new Set<OnPlayerLeave>;
    Modding.onListenerAdded<OnPlayerJoin>(object => joinListeners.add(object));
    Modding.onListenerRemoved<OnPlayerJoin>(object => joinListeners.delete(object));
    Modding.onListenerAdded<OnPlayerLeave>(object => leaveListeners.add(object));
    Modding.onListenerRemoved<OnPlayerLeave>(object => leaveListeners.delete(object));

    Players.PlayerAdded.Connect(player => {
      for (const listener of joinListeners)
        task.spawn(() => listener.onPlayerJoin(player));
    });

    Players.PlayerRemoving.Connect(player => {
      for (const listener of leaveListeners)
        task.spawn(() => listener.onPlayerLeave(player));
    });

    for (const player of Players.GetPlayers())
      for (const listener of joinListeners)
        task.spawn(() => listener.onPlayerJoin(player));
  }
}