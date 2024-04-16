import { Controller, type OnStart } from "@flamework/core";

import { Events } from "client/network";
import { Movement } from "client/components/movement";
import type { CameraController } from "./camera";

@Controller()
export class InitializationController implements OnStart {
  public constructor(
    private readonly camera: CameraController
  ) { }

  public onStart(): void {
    Events.data.initialize();
    Movement.start(); // remove if you don't want custom movement
    this.camera.set("Fixed"); // set to preferred camera
  }
}