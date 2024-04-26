import { Service, type OnInit } from "@flamework/core";

import { Events } from "server/network";
import Pakt from "shared/pakt";

@Service()
export class CharacterService implements OnInit {
  public onInit(): void {
    Events.character.toggleDefaultMovement.connect((player, on) => this.toggleDefaultMovement(player, on));
    Pakt.receiveServerEvent(Events.encoded.test, (player, packet) => {
      print(player, "sent packet:", packet);
    });
  }

  public toggleDefaultMovement(player: Player, on: boolean): void {
    player.DevComputerMovementMode = on ? Enum.DevComputerMovementMode.KeyboardMouse : Enum.DevComputerMovementMode.Scriptable;
    player.DevTouchMovementMode = on ? Enum.DevTouchMovementMode.DynamicThumbstick : Enum.DevTouchMovementMode.Scriptable;
  }
}