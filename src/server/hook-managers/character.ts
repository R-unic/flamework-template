import { Modding, Service, type OnStart } from "@flamework/core";

import type { OnPlayerJoin } from "server/hooks";
import type { OnCharacterAdd, OnCharacterRemove } from "shared/hooks";

@Service({ loadOrder: 0 })
export class CharacterAddService implements OnStart, OnPlayerJoin {
  private readonly addListeners = new Set<OnCharacterAdd>;
  private readonly removeListeners = new Set<OnCharacterRemove>;

  public onStart(): void {
    Modding.onListenerAdded<OnCharacterAdd>(object => this.addListeners.add(object));
    Modding.onListenerRemoved<OnCharacterAdd>(object => this.addListeners.delete(object));
    Modding.onListenerAdded<OnCharacterRemove>(object => this.removeListeners.add(object));
    Modding.onListenerRemoved<OnCharacterRemove>(object => this.removeListeners.delete(object));
  }

  public onPlayerJoin(player: Player): void {
    if (player.Character !== undefined)
      this.characterAdded(player.Character);

    player.CharacterAdded.Connect(character => this.characterAdded(character));
    player.CharacterRemoving.Connect(async model => {
      for (const listener of this.removeListeners)
        listener.onCharacterRemove(<CharacterModel>model);
    });
  }

  private async characterAdded(character: Model): Promise<void> {
    for (const listener of this.addListeners)
      listener.onCharacterAdd(<CharacterModel>character);
  }
}