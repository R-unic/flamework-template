import { Dependency } from "@flamework/core";
import { Component, type Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";

import { Player } from "shared/utility/client";
import { CameraControllerComponent } from "client/base-components/camera-controller-component";
import type { CameraController } from "client/controllers/camera";

@Component({ tag: "FirstPersonCamera" })
export class FirstPersonCamera extends CameraControllerComponent {
  public static create(controller: CameraController): FirstPersonCamera {
    const components = Dependency<Components>();
    const camera = World.CurrentCamera!.Clone();
    camera.Name = "FirstPersonCamera";
    camera.VRTiltAndRollEnabled = true;
    camera.Parent = controller.cameraStorage;

    return components.addComponent(camera);
  }

  public override toggle(on: boolean): void {
    super.toggle(on);
    Player.CameraMode = on ? Enum.CameraMode.LockFirstPerson : Player.CameraMode;
  }
}