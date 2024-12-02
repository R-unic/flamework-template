import { Dependency, type OnRender } from "@flamework/core";
import { Component, type Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";
import { $nameof } from "rbxts-transform-debug";

import { ProceduralAnimationHost } from "client/classes/procedural-animation-host";

import { FirstPersonCamera } from "./first-person";
import type { CameraController } from "client/controllers/camera";
import type { MouseController } from "client/controllers/mouse";
import type { CharacterController } from "client/controllers/character";

@Component({ tag: $nameof<FirstPersonAnimatedCamera>() })
export class FirstPersonAnimatedCamera extends FirstPersonCamera implements OnRender {
  public readonly animator;

  public static create(controller: CameraController): FirstPersonAnimatedCamera {
    const components = Dependency<Components>();
    const camera = World.CurrentCamera!.Clone();
    camera.Name = $nameof<FirstPersonAnimatedCamera>();
    camera.Parent = controller.cameraStorage;

    return components.addComponent(camera);
  }

  public constructor(
    mouse: MouseController,
    character: CharacterController,
    private readonly camera: CameraController
  ) {
    super(mouse, character);
    this.animator = new ProceduralAnimationHost(this.instance);
  }

  public onRender(dt: number): void {
    super.onRender(dt);
    if (this.camera.currentName !== this.instance.Name) return;

    const offset = this.animator.update(dt);
    this.instance.CFrame = this.instance.CFrame.mul(offset);
  }
}