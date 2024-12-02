import { BaseComponent } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";

const { rad } = math;

export class CameraComponent<A extends {} = {}> extends BaseComponent<A, Camera> {
  protected readonly offsets: CFrame[] = [];

  public toggle(on: boolean): void {
    World.CurrentCamera = on ? this.instance : World.CurrentCamera;
  }

  public setCFrame(cframe: CFrame): void {
    this.instance.CFrame = cframe;
  }

  public setPosition(position: Vector3): void {
    this.setCFrame(new CFrame(position));
  }

  public setOrientation(orientation: Vector3): void {
    this.setCFrame(this.instance.CFrame.mul(CFrame.Angles(rad(orientation.X), rad(orientation.Y), rad(orientation.Z))));
  }

  public lookAt(position: Vector3): void {
    this.setCFrame(CFrame.lookAt(this.instance.CFrame.Position, position));
  }
}