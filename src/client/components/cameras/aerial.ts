import { Dependency, type OnRender } from "@flamework/core";
import { Component, type Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";

import { Player } from "shared/utility/client";
import { CameraControllerComponent } from "client/base-components/camera-controller-component";
import type { CameraController } from "client/controllers/camera";
import type { CharacterController } from "client/controllers/character";

interface Attributes {
  AerialCamera_Height: number;
}

@Component({
  tag: "AerialCamera",
  defaults: {
    AerialCamera_Height: 20
  }
})
export class AerialCamera extends CameraControllerComponent<Attributes> implements OnRender {
  public static create(controller: CameraController): AerialCamera {
    const components = Dependency<Components>();
    const camera = World.CurrentCamera!.Clone();
    camera.CameraType = Enum.CameraType.Scriptable;
    camera.Name = "AerialCamera";
    camera.Parent = controller.cameraStorage;

    return components.addComponent(camera);
  }

  public constructor(
    private readonly character: CharacterController
  ) { super(); }

  public onRender(dt: number): void {
    const root = this.character.getRoot();
    if (root === undefined) return;

    const position = root.Position.add(new Vector3(0, this.getHeight(), 0));
    this.setCFrame(CFrame.lookAt(position, root.Position));
  }

  public override toggle(on: boolean): void {
    super.toggle(on);
    Player.CameraMode = on ? Enum.CameraMode.Classic : Player.CameraMode;
  }

  private getHeight(): number | undefined {
    return this.attributes.AerialCamera_Height;
  }
}