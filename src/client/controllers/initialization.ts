import { Controller, type OnStart } from "@flamework/core";

import type { OnCharacterAdd } from "shared/hooks";
import { Events } from "client/network";

import { Movement } from "client/components/movement";
import type { CameraController } from "./camera";

@Controller({ loadOrder: 1000 })
export class InitializationController implements OnStart, OnCharacterAdd {
  public constructor(
    private readonly camera: CameraController
  ) { }

  public onStart(): void {
    this.camera.set("Default"); // set to preferred camera
    Events.data.initialize();
  }

  public onCharacterAdd(character: CharacterModel): void {
    Movement.start(character); // remove if you don't want custom movement
  }
}