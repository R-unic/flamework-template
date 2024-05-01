import { Dependency, type OnRender, type OnStart } from "@flamework/core";
import { Component, type Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";

import { ProceduralAnimationHost } from "client/classes/procedural-animation-host";

import { CameraControllerComponent } from "client/base-components/camera-controller-component";
import type { CameraController } from "client/controllers/camera";
import type { CharacterController } from "client/controllers/character";

@Component({ tag: "ProcedurallyAnimatedCamera" })
export class ProcedurallyAnimatedCamera extends CameraControllerComponent implements OnStart, OnRender {
  private readonly proceduralAnimations;

  public static create(controller: CameraController): ProcedurallyAnimatedCamera {
    const components = Dependency<Components>();
    const camera = World.CurrentCamera!; // every other camera component should clone a new camera
    camera.Name = "ProcedurallyAnimatedCamera";
    camera.Parent = controller.cameraStorage;

    return components.addComponent(camera);
  }

  public constructor(
    character: CharacterController,
    private readonly camera: CameraController
  ) {
    super();
    this.proceduralAnimations = new ProceduralAnimationHost(this.instance, character);
  }

  public onStart(): void {
    this.proceduralAnimations.start();
  }

  public onRender(dt: number): void {
    if (this.camera.get() !== this) return;
    const offset = this.proceduralAnimations.update(dt);
    this.instance.CFrame = this.instance.CFrame.mul(offset);
  }
}