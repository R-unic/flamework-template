import Iris from "@rbxts/iris";

import { createVector3Tree } from "shared/iris-utility";
import { Quaternion } from "./quaternion";
import type { ControlPanelDropdownRenderer } from "shared/structs/control-panel";

export class Transform implements ControlPanelDropdownRenderer {
  public constructor(
    public readonly position = Vector3.zero,
    public readonly rotation = Quaternion.identity
  ) { }

  public static fromCFrame(cframe: CFrame): Transform {
    return new Transform(cframe.Position, Quaternion.fromCFrame(cframe));
  }

  public static fromVector3(vector: Vector3): Transform {
    return new Transform(vector, Quaternion.identity);
  }

  public toCFrame(): CFrame {
    return this.rotation.toCFrame(this.position);
  }

  public translate(translation: Vector3): Transform {
    return new Transform(this.position.add(translation), this.rotation);
  }

  public rotate(rotation: Quaternion): Transform {
    return new Transform(this.position, this.rotation.mul(rotation));
  }

  public apply(pv: PVInstance): void {
    pv.PivotTo(this.toCFrame());
  }

  public renderControlPanelDropdown(this: Writable<this>, prefix?: string): void {
    Iris.Tree([(prefix !== undefined ? prefix + " " : "") + "Transform"]);

    this.position = createVector3Tree(this.position, "Position");
    this.rotation.renderControlPanelDropdown("Rotation");

    Iris.End();
  }
}