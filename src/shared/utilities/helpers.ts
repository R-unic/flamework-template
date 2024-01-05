import { ReplicatedFirst, Players } from "@rbxts/services";
import { StorableVector3 } from "shared/data-models/utility";

const { round, abs } = math;

export const Assets = ReplicatedFirst.Assets;

export const now = () => round(tick());
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
