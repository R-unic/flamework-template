import { Controller, OnRender, type OnInit } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { Lazy } from "@rbxts/lazy";
import Object from "@rbxts/object-utils";
import Iris from "@rbxts/iris";

import type { LogStart } from "shared/hooks";
import { DefaultCamera } from "client/components/cameras/default";
import { FirstPersonCamera } from "client/components/cameras/first-person";
import { AerialCamera } from "client/components/cameras/aerial";
import { FixedCamera } from "client/components/cameras/fixed";
import { FlyOnTheWallCamera } from "client/components/cameras/fly-on-the-wall";
import { FirstPersonAnimatedCamera } from "client/components/cameras/first-person-animated";
import type { ControlPanelDropdownRenderer } from "shared/structs/control-panel";

import { ControlPanelRenderable } from "./control-panel";
import type { CameraComponent } from "client/base-components/camera";

// add new camera components here
export interface Cameras {
  readonly Default: DefaultCamera;
  readonly FirstPerson: FirstPersonCamera;
  readonly Aerial: AerialCamera;
  readonly Fixed: FixedCamera;
  readonly FlyOnTheWall: FlyOnTheWallCamera;
  readonly FirstPersonAnimated: FirstPersonAnimatedCamera;
}

@Controller()
@ControlPanelRenderable("Camera")
export class CameraController implements OnInit, OnRender, LogStart, ControlPanelDropdownRenderer {
  public readonly cameraStorage = new Instance("Actor", World);
  public readonly cameras = new Lazy<Cameras>(() => ({
    Default: DefaultCamera.create(this),
    FirstPerson: FirstPersonCamera.create(this),
    Aerial: AerialCamera.create(this),
    Fixed: FixedCamera.create(this),
    FlyOnTheWall: FlyOnTheWallCamera.create(this),
    FirstPersonAnimated: FirstPersonAnimatedCamera.create(this)
  }));

  public currentName!: keyof Cameras;

  public onInit(): void {
    this.cameraStorage.Name = "Cameras";
    this.set("Default");
  }

  public onRender(dt: number): void {
    const camera = this.get();
    if (camera !== undefined && "onRender" in camera && typeOf(camera.onRender) === "function") {
      const update = <(camera: CameraComponent, dt: number) => void>camera.onRender;
      update(camera, dt);
    }
  }

  public renderControlPanelDropdown(): void {
    const currentCamera = this.get().instance;
    const fov = Iris.SliderNum(["FOV", 0.25, 1, 120], { number: Iris.State(currentCamera.FieldOfView) });
    if (fov.numberChanged())
      currentCamera.FieldOfView = fov.state.number.get();

    const cameraComponents = Object.keys(this.cameras.getValue()).sort();
    const componentIndex = Iris.State<keyof Cameras>(this.currentName);
    Iris.Combo(["Camera Component"], { index: componentIndex });
    {
      for (const component of cameraComponents)
        Iris.Selectable([component, component], { index: componentIndex });
    }
    Iris.End();

    if (this.currentName !== componentIndex.get())
      this.set(componentIndex.get());
  }

  public set(cameraName: keyof Cameras): void {
    this.currentName = cameraName;
    for (const [otherCameraName] of pairs(this.cameras.getValue()))
      this.get(otherCameraName).toggle(cameraName === otherCameraName);
  }

  public get<T extends CameraComponent>(cameraName: keyof Cameras = this.currentName): T {
    return <T>this.cameras.getValue()[cameraName];
  }
}