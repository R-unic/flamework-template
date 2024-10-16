import { Controller, type OnStart } from "@flamework/core";

import { Events } from "client/network";

import type { CameraController } from "./camera";

@Controller({ loadOrder: 1000 })
export class InitializationController implements OnStart {
  public constructor(
    private readonly camera: CameraController
  ) { }

  public onStart(): void {
    this.camera.set("Default"); // set to preferred camera
    Events.data.initialize();
  }
}