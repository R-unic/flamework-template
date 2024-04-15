import { Service, type OnInit } from "@flamework/core";
import { Events } from "server/network";

@Service()
export class CharacterService implements OnInit {
  public onInit(): void {
    Events.character.toggleDefaultMovement.connect((player, on) => this.toggleDefaultMovement(player, on));
  }

  public toggleDefaultMovement(player: Player, on: boolean): void {
    player.DevComputerMovementMode = Enum.DevComputerMovementMode.Scriptable;
    player.DevTouchMovementMode = Enum.DevTouchMovementMode.Scriptable;
  }
}