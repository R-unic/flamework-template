import { Controller, OnRender, type OnInit } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";

import type { LogStart } from "shared/hooks";
import { DefaultCamera } from "client/components/cameras/default";
import { FirstPersonCamera } from "client/components/cameras/first-person";
import { AerialCamera } from "client/components/cameras/aerial";
import { FixedCamera } from "client/components/cameras/fixed";
import { FlyOnTheWallCamera } from "client/components/cameras/fly-on-the-wall";
import { FirstPersonAnimatedCamera } from "client/components/cameras/first-person-animated";

import type { CameraControllerComponent } from "client/base-components/camera-controller-component";

// add new camera components here
interface Cameras {
  readonly Default: DefaultCamera;
  readonly FirstPerson: FirstPersonCamera;
  readonly Aerial: AerialCamera;
  readonly Fixed: FixedCamera;
  readonly FlyOnTheWall: FlyOnTheWallCamera;
  readonly FirstPersonAnimated: FirstPersonAnimatedCamera;
}

@Controller()
export class CameraController implements OnInit, OnRender, LogStart {
  public readonly cameraStorage = new Instance("Actor", World);
  public cameras!: Cameras;
  public currentName!: keyof typeof this.cameras;

  public onInit(): void {
    this.cameraStorage.Name = "Cameras";
    this.cameras = {
      Default: DefaultCamera.create(this),
      FirstPerson: FirstPersonCamera.create(this),
      Aerial: AerialCamera.create(this),
      Fixed: FixedCamera.create(this),
      FlyOnTheWall: FlyOnTheWallCamera.create(this),
      FirstPersonAnimated: FirstPersonAnimatedCamera.create(this)
    };
  }

  public onRender(dt: number): void {
    const camera = this.get();
    if (camera !== undefined && "onRender" in camera && typeOf(camera.onRender) === "function") {
      const update = <(camera: CameraControllerComponent, dt: number) => void>camera.onRender;
      update(camera, dt);
    }
  }

  public set(cameraName: keyof typeof this.cameras): void {
    this.currentName = cameraName;
    for (const [otherCameraName] of pairs(this.cameras))
      this.get(otherCameraName).toggle(cameraName === otherCameraName);
  }

  public get<T extends CameraControllerComponent>(cameraName: keyof typeof this.cameras = this.currentName): T {
    return <T>this.cameras[cameraName];
  }
}