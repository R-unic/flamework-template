import { Controller, OnRender, type OnInit } from "@flamework/core";
import { CameraControllerComponent } from "client/base-components/camera-controller-component";

import type { LogStart } from "shared/hooks";
import { FirstPersonCamera } from "client/components/cameras/first-person";

interface Cameras {
  readonly FirstPerson: FirstPersonCamera;
}

@Controller()
export class CameraController implements OnInit, OnRender, LogStart {
  private cameras!: Cameras;
  private current!: keyof typeof this.cameras;

  public onInit(): void {
    this.cameras = {
      FirstPerson: FirstPersonCamera.create()
    };
  }

  public onRender(dt: number): void {
    const camera = this.get();
    if ("onRender" in camera && typeOf(camera.onRender) === "function") {
      const update = <(dt: number) => void>camera.onRender;
      update(dt);
    }
  }

  public set(cameraName: keyof typeof this.cameras): void {
    for (const [otherCameraName] of pairs(this.cameras))
      this.get(otherCameraName).toggle(cameraName === otherCameraName);
  }

  private get(cameraName: keyof typeof this.cameras = this.current): CameraControllerComponent {
    return this.cameras[cameraName];
  }
}