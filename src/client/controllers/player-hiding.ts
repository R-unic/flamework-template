import { Controller, type OnInit } from "@flamework/core";
import { Players } from "@rbxts/services";

import { getCharacterParts } from "shared/utility/instances";

import type { CharacterController } from "./character";

@Controller()
export class PlayerHidingController implements OnInit {
  public constructor(
    private readonly character: CharacterController
  ) { }

  public onInit(): void {
    for (const character of this.getAllCharacters())
      task.spawn(() => {
        const parts = getCharacterParts(character);
        for (const part of parts)
          part.SetAttribute("DefaultTransparency", part.Transparency);
      });
  }

  public toggle(on: boolean): void {
    task.spawn(() => {
      for (const character of this.getAllCharacters())
        task.spawn(() => {
          const parts = getCharacterParts(character);
          for (const part of parts)
            part.Transparency = on ? 1 : (<number>part.GetAttribute("DefaultTransparency") ?? 0);
        });
    });
  }

  private getAllCharacters(): CharacterModel[] {
    return Players.GetPlayers()
      .map(player => player.Character!)
      .filter((character): character is CharacterModel => character !== this.character.get());
  }
}