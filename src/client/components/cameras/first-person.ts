import { Dependency } from "@flamework/core";
import { Component, type Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";

import { Player } from "shared/utility/client";

import { CameraControllerComponent } from "client/base-components/camera-controller-component";
import type { CameraController } from "client/controllers/camera";
import type { MouseController } from "client/controllers/mouse";
import type { CharacterController } from "client/controllers/character";

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

  public constructor(
    private readonly mouse: MouseController,
    protected readonly character: CharacterController
  ) { super(); }

  public onRender(dt: number): void {
    const character = this.character.get();
    if (character === undefined || this.character.getRoot() === undefined) return;
    this.instance.CameraSubject = character.Humanoid;
  }

  public override toggle(on: boolean): void {
    super.toggle(on);
    this.onRender(0);
    this.mouse.behavior(on ? Enum.MouseBehavior.LockCenter : this.mouse.behavior);
    Player.CameraMode = on ? Enum.CameraMode.LockFirstPerson : Player.CameraMode;
  }
}