import { Dependency, type OnRender } from "@flamework/core";
import { Component, type Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";

import { Character, Player } from "shared/utility/client";
import { CameraControllerComponent } from "client/base-components/camera-controller-component";
import type { CameraController } from "client/controllers/camera";

@Component({ tag: "FlyOnTheWallCamera" })
export class FlyOnTheWallCamera extends CameraControllerComponent implements OnRender {
  public static create(controller: CameraController): FlyOnTheWallCamera {
    const components = Dependency<Components>();
    const camera = World.CurrentCamera!.Clone();
    camera.CameraType = Enum.CameraType.Scriptable;
    camera.Name = "FlyOnTheWallCamera";
    camera.Parent = controller.cameraStorage;

    return components.addComponent(camera);
  }

  public onRender(dt: number): void {
    const characterPosition = Character.PrimaryPart.Position;
    this.lookAt(characterPosition);
  }

  public override toggle(on: boolean): void {
    super.toggle(on);
    Player.CameraMode = on ? Enum.CameraMode.Classic : Player.CameraMode;
  }
}