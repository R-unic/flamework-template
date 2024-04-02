import { ReplicatedFirst, RunService as Runtime, MarketplaceService as Market } from "@rbxts/services";

import { StorableVector3 } from "../data-models/common";

const { abs, max, min } = math;

export const Assets = ReplicatedFirst.Assets;

export const isNaN = (n: number) => n !== n;
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

export interface DevProductInfo {
  readonly Description: string;
  readonly PriceInRobux: number;
  readonly ProductId: number;
  readonly IconImageAssetId: number;
  readonly Name: string;
}

export function getDevProducts(): DevProductInfo[] {
  return getPageContents(Market.GetDeveloperProductsAsync());
}

export function getPageContents<T extends defined>(pages: Pages<T>): T[] {
  const contents: T[] = [];
  while (!pages.IsFinished) {
    const page = pages.GetCurrentPage();
    for (const item of page)
      contents.push(item);

    pages.AdvanceToNextPageAsync();
  }

  return contents;
}

export async function getInstancePath(instance: Instance): Promise<string> {
  let path = instance.GetFullName()
    .gsub("Workspace", "World")[0]
    .gsub("PlayerGui", "UI")[0];

  if (Runtime.IsClient()) {
    const { Player } = await import("./client");
    path = path.gsub(`Players.${Player.Name}.`, "")[0];
  }

  return path;
}

export function shuffle<T>(array: T[]): T[] {
  // Fisher-Yates shuffle algorithm
  const shuffledArray = [...array];
  for (let i = shuffledArray.size() - 1; i > 0; i--) {
    const j = math.floor(math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

export function removeDuplicates<T extends defined>(array: T[]): T[] {
  const seen: T[] = [];
  const result: T[] = [];
  for (const value of array)
    if (!seen.includes(value)) {
      result.push(value);
      seen.push(value);
    }

  return result;
}

export function flatten<T extends defined>(array: (T | T[])[]): T[] {
  const result: T[] = [];
  for (const value of array) {
    if (typeOf(value) === "table") {
      const flattenedSubtable = flatten(<T[]>value);
      for (const subValue of flattenedSubtable)
        result.push(subValue);
    }
    else
      result.push(<T>value);
  }
  return result;
}

export function reverse<T extends defined>(arr: T[]): T[] {
  return arr.map((_, i) => arr[arr.size() - 1 - i]);
}

export function slice<T extends defined>(arr: T[], start: number, finish?: number): T[] {
  const length = arr.size();

  // Handling negative indices
  const startIndex = start < 0 ? max(length + start, 0) : min(start, length);
  const endIndex = finish === undefined ? length : finish < 0 ? max(length + finish, 0) : min(finish, length);

  // Creating a new array with sliced elements
  const slicedArray: T[] = [];
  for (let i = startIndex; i < endIndex; i++)
    slicedArray.push(arr[i]);

  return slicedArray;
}