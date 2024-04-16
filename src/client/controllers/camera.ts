import { Controller, OnRender, type OnInit } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";

import type { LogStart } from "shared/hooks";
import type { CameraControllerComponent } from "client/base-components/camera-controller-component";
import { DefaultCamera } from "client/components/cameras/default";
import { FirstPersonCamera } from "client/components/cameras/first-person";
import { AerialCamera } from "client/components/cameras/aerial";

// add new camera components here
interface Cameras {
  readonly Default: DefaultCamera;
  readonly FirstPerson: FirstPersonCamera;
  readonly Aerial: AerialCamera
}

@Controller()
export class CameraController implements OnInit, OnRender, LogStart {
  public readonly cameraStorage = new Instance("Folder", World);
  private current!: keyof typeof this.cameras;
  private cameras!: Cameras;

  public onInit(): void {
    this.cameraStorage.Name = "Cameras";
    this.cameras = {
      Default: DefaultCamera.create(this),
      FirstPerson: FirstPersonCamera.create(this),
      Aerial: AerialCamera.create(this)
    };
  }

  public onRender(dt: number): void {
    const camera = this.get();
    if ("onRender" in camera && typeOf(camera.onRender) === "function") {
      const update = <(camera: CameraControllerComponent, dt: number) => void>camera.onRender;
      update(camera, dt);
    }
  }

  public set(cameraName: keyof typeof this.cameras): void {
    this.current = cameraName;
    for (const [otherCameraName] of pairs(this.cameras))
      this.get(otherCameraName).toggle(cameraName === otherCameraName);
  }

  private get(cameraName: keyof typeof this.cameras = this.current): CameraControllerComponent {
    return this.cameras[cameraName];
  }
}