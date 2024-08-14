import { Workspace as World } from "@rbxts/services";
import type { StorableVector3 } from "shared/data-models/common";

const { abs } = math;

export const toStorableVector3 = ({ X, Y, Z }: Vector3) => ({ x: X, y: Y, z: Z });
export const toUsableVector3 = ({ x, y, z }: StorableVector3) => new Vector3(x, y, z);
export function toRegion3({ CFrame, Size }: Part, areaShrink = 0): Region3 {
  const { X: sx, Y: sy, Z: sz } = Size;
  const [x, y, z, r00, r01, r02, r10, r11, r12, r20, r21, r22] = CFrame.GetComponents();
  const wsx = 0.5 * (abs(r00) * sx + abs(r01) * sy + abs(r02) * sz);
  const wsy = 0.5 * (abs(r10) * sx + abs(r11) * sy + abs(r12) * sz);
  const wsz = 0.5 * (abs(r20) * sx + abs(r21) * sy + abs(r22) * sz);
  return new Region3(
    new Vector3(x - wsx + areaShrink, y - wsy, z - wsz + areaShrink),
    new Vector3(x + wsx - areaShrink, y + wsy, z + wsz - areaShrink)
  );
}

export function createRayVisualizer(position: Vector3, direction: Vector3, lifetime = 3, transparency = 0.7, color = new Color3(1, 0, 0)): void {
  const raySize = direction.Magnitude;
  const visual = new Instance("Part", World);
  visual.Color = color;
  visual.Transparency = transparency;
  visual.Anchored = true;
  visual.CanCollide = false;
  visual.Size = new Vector3(0.5, 0.5, raySize);
  visual.CFrame = CFrame.lookAlong(position.add(direction.mul(raySize / 2)), direction);
  task.delay(lifetime, () => visual.Destroy());
}

export function combineCFrames(cframes: CFrame[]): CFrame {
  return cframes.reduce((sum, cf) => sum.mul(cf), new CFrame);
}

export const STUDS_TO_METERS_CONSTANT = 3.571;
export function studsToMeters(studs: number): number {
  return studs / STUDS_TO_METERS_CONSTANT;
}

export function metersToStuds(meters: number): number {
  return meters * STUDS_TO_METERS_CONSTANT;
}