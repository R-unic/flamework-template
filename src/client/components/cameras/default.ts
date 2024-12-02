import { Dependency } from "@flamework/core";
import { Component, type Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";
import { $nameof } from "rbxts-transform-debug";

import { Player } from "client/utility";

import { CameraComponent } from "client/base-components/camera";
import type { CameraController } from "client/controllers/camera";

@Component({ tag: $nameof<DefaultCamera>() })
export class DefaultCamera extends CameraComponent {
  public static create(controller: CameraController): DefaultCamera {
    const components = Dependency<Components>();
    const camera = World.CurrentCamera!; // every other camera component should clone a new camera
    camera.Name = $nameof<DefaultCamera>();
    camera.Parent = controller.cameraStorage;

    return components.addComponent(camera);
  }

  public override toggle(on: boolean): void {
    super.toggle(on);
    Player.CameraMode = on ? Enum.CameraMode.Classic : Player.CameraMode;
  }
}