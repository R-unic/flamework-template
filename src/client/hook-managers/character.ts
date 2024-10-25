import { Modding, Controller, type OnStart } from "@flamework/core";

import type { OnCharacterAdd, OnCharacterRemove } from "shared/hooks";
import { Player } from "client/utility";

@Controller({ loadOrder: 0 })
export class CharacterAddController implements OnStart {
  public onStart(): void {
    const addListeners = new Set<OnCharacterAdd>;
    const removeListeners = new Set<OnCharacterRemove>;
    Modding.onListenerAdded<OnCharacterAdd>(object => addListeners.add(object));
    Modding.onListenerRemoved<OnCharacterAdd>(object => addListeners.delete(object));
    Modding.onListenerAdded<OnCharacterRemove>(object => removeListeners.add(object));
    Modding.onListenerRemoved<OnCharacterRemove>(object => removeListeners.delete(object));

    async function characterAdded(character: Model): Promise<void> {
      for (const listener of addListeners)
        listener.onCharacterAdd(<CharacterModel>character);
    }

    if (Player.Character !== undefined)
      characterAdded(Player.Character);

    Player.CharacterAdded.Connect(characterAdded);
    Player.CharacterRemoving.Connect(async model => {
      for (const listener of removeListeners)
        listener.onCharacterRemove(<CharacterModel>model);
    });
  }
}