import { BaseComponent } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";

export class CameraControllerComponent<A extends {} = {}> extends BaseComponent<A, Camera> {
  public toggle(on: boolean): void {
    World.CurrentCamera = on ? this.instance : World.CurrentCamera;
  }
}