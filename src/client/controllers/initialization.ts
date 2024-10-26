import { Controller, type OnStart } from "@flamework/core";

import { Retry } from "shared/decorators";
import type { CameraController } from "./camera";

@Controller({ loadOrder: 1 })
export class InitializationController implements OnStart {
  public constructor(
    private readonly camera: CameraController
  ) { }

  public onStart(): void {
    this.camera.set("Default"); // set to preferred camera
    this.repeatedFunction();
  }

  @Retry(3, 1, () => true)
  public repeatedFunction(): void {
    print("repeated")
  }
}