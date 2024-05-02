import { Dependency, type OnRender } from "@flamework/core";
import { Component, type Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";

import { Player } from "shared/utility/client";
import { ProceduralAnimationHost } from "client/classes/procedural-animation-host";

import { FirstPersonCamera } from "./first-person";
import type { CameraController } from "client/controllers/camera";
import type { MouseController } from "client/controllers/mouse";
import type { CharacterController } from "client/controllers/character";

@Component({ tag: "FirstPersonAnimatedCamera" })
export class FirstPersonAnimatedCamera extends FirstPersonCamera implements OnRender {
  public readonly animator;

  public static create(controller: CameraController): FirstPersonAnimatedCamera {
    const components = Dependency<Components>();
    const camera = World.CurrentCamera!.Clone();
    camera.Name = "FirstPersonAnimatedCamera";
    camera.Parent = controller.cameraStorage;

    return components.addComponent(camera);
  }

  public constructor(
    mouse: MouseController,
    character: CharacterController,
    private readonly camera: CameraController
  ) {
    super(mouse, character);
    this.animator = new ProceduralAnimationHost(this.instance, character);
    this.animator.start();
  }

  public onRender(dt: number): void {
    super.onRender(dt);
    if (this.camera.get() !== this) return;

    const offset = this.animator.update(dt);
    this.instance.CFrame = this.instance.CFrame.mul(offset);
  }
}