import { Dependency } from "@flamework/core";
import { Component, type Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";

import { CameraControllerComponent } from "client/base-components/camera-controller-component";
import { Player } from "shared/utility/client";

@Component({ tag: "DefaultCamera" })
export class DefaultCamera extends CameraControllerComponent {
  public static create(): DefaultCamera {
    const components = Dependency<Components>();
    const camera = World.CurrentCamera!;
    camera.Name = "DefaultCamera";

    return components.addComponent(camera); // every other camera component should create a new camera
  }

  public override toggle(on: boolean): void {
    Player.CameraMode = on ? Enum.CameraMode.LockFirstPerson : Enum.CameraMode.Classic;
  }
}