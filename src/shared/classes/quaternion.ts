import Iris from "@rbxts/iris";

import type { ControlPanelDropdownRenderer } from "shared/structs/control-panel";

const { sin, cos, sqrt } = math;

export class Quaternion implements ControlPanelDropdownRenderer {
  public static readonly identity = new Quaternion(0, 0, 0, 1);

  public constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly w: number
  ) { }

  /**
   * Constructs a quaternion from an axis-angle representation
   * @param axis - The axis of rotation (must be a unit vector)
   * @param angle - The angle of rotation in radians
   * @returns The resulting quaternion
   */
  public static fromAxisAngle(axis: Vector3, angle: number): Quaternion {
    const halfAngle = angle / 2;
    const sinHalfAngle = sin(halfAngle);

    return new Quaternion(
      axis.X * sinHalfAngle,
      axis.Y * sinHalfAngle,
      axis.Z * sinHalfAngle,
      cos(halfAngle)
    );
  }

  /**
   * Constructs a quaternion from a CFrame
   *
   * Assumes the CFrame has no position (or position is irrelevant for rotation)
   * @param cframe - The CFrame to extract the quaternion from
   * @returns The quaternion representation of the rotation
   */
  public static fromCFrame(cframe: CFrame): Quaternion {
    const [right, up, back] = [cframe.XVector, cframe.YVector, cframe.ZVector];
    const trace = right.X + up.Y + back.Z;

    if (trace > 0) {
      const s = sqrt(trace + 1) * 2;
      return new Quaternion(
        (up.Z - back.Y) / s,
        (back.X - right.Z) / s,
        (right.Y - up.X) / s,
        0.25 * s
      );
    } else if (right.X > up.Y && right.X > back.Z) {
      const s = sqrt(1 + right.X - up.Y - back.Z) * 2;
      return new Quaternion(
        0.25 * s,
        (up.X + right.Y) / s,
        (back.X + right.Z) / s,
        (up.Z - back.Y) / s
      );
    } else if (up.Y > back.Z) {
      const s = sqrt(1 + up.Y - right.X - back.Z) * 2;
      return new Quaternion(
        (up.X + right.Y) / s,
        0.25 * s,
        (back.Y + up.Z) / s,
        (back.X - right.Z) / s
      );
    } else {
      const s = sqrt(1 + back.Z - right.X - up.Y) * 2;
      return new Quaternion(
        (back.X + right.Z) / s,
        (back.Y + up.Z) / s,
        0.25 * s,
        (right.Y - up.X) / s
      );
    }
  }

  /**
    * Converts the quaternion to a CFrame
    *
    * The position is assumed to be (0, 0, 0) unless provided separately
    */
  public toCFrame(position = new Vector3): CFrame {
    return new CFrame(
      position.X,
      position.Y,
      position.Z,
      this.x,
      this.y,
      this.z,
      this.w
    );
  }

  public add(q: Quaternion): Quaternion {
    return new Quaternion(
      this.x + q.x,
      this.y + q.y,
      this.z + q.z,
      this.w + q.w
    );
  }

  public sub(q: Quaternion): Quaternion {
    return new Quaternion(
      this.x - q.x,
      this.y - q.y,
      this.z - q.z,
      this.w - q.w
    );
  }

  public mul(q: Quaternion): Quaternion {
    return new Quaternion(
      this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
      this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
      this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w,
      this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z
    );
  }

  public div(q: Quaternion): Quaternion {
    const inverse = q.inverse();
    return this.mul(inverse);
  }

  public inverse(): Quaternion {
    const norm = this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    return new Quaternion(
      -this.x / norm,
      -this.y / norm,
      -this.z / norm,
      this.w / norm
    );
  }

  public renderControlPanelDropdown(this: Writable<this>, prefix?: string): void {
    Iris.Tree([(prefix !== undefined ? prefix + " " : "") + "Quaternion"]);

    const x = Iris.SliderNum(["X", 0.01, -1, 1], { number: Iris.State(this.x) });
    if (x.numberChanged())
      this.x = x.state.number.get();

    const y = Iris.SliderNum(["Y", 0.01, -1, 1], { number: Iris.State(this.y) });
    if (y.numberChanged())
      this.y = y.state.number.get();

    const z = Iris.SliderNum(["Z", 0.01, -1, 1], { number: Iris.State(this.z) });
    if (z.numberChanged())
      this.z = z.state.number.get();

    const w = Iris.SliderNum(["W", 0.01, -1, 1], { number: Iris.State(this.w) });
    if (w.numberChanged())
      this.w = w.state.number.get();

    Iris.End();
  }
}