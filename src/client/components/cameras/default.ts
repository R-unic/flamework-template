import { Dependency } from "@flamework/core";
import { Component, type Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";

import { Player } from "shared/utility/client";
import { CameraControllerComponent } from "client/base-components/camera-controller-component";
import type { CameraController } from "client/controllers/camera";

@Component({ tag: "DefaultCamera" })
export class DefaultCamera extends CameraControllerComponent {
  public static create(controller: CameraController): DefaultCamera {
    const components = Dependency<Components>();
    const camera = World.CurrentCamera!; // every other camera component should clone a new camera
    camera.Name = "DefaultCamera";
    camera.Parent = controller.cameraStorage;

    return components.addComponent(camera);
  }

  public override toggle(on: boolean): void {
    super.toggle(on);
    Player.CameraMode = on ? Enum.CameraMode.Classic : Player.CameraMode;
  }
}