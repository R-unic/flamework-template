import { ReplicatedFirst } from "@rbxts/services";
import StringUtils from "@rbxts/string-utils";

import { StorableVector3 } from "../data-models/utility";
import { Exception } from "../exceptions";

const { floor, log, abs, max, min } = math;

export const Assets = ReplicatedFirst.Assets;

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

export function toTimerFormat(seconds: number): string {
  const hours = floor(seconds / 3600);
  const minutes = floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedHours = hours > 0 ? `${hours}:` : "";
  const formattedMinutes = minutes < 10 && hours > 0 ? `0${minutes}` : `${minutes}`;
  const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

  return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
}

const s = 1,
  m = 60,
  h = 3600,
  d = 86400,
  w = 604800;

const timePatterns = {
  s, second: s, seconds: s,
  m, minute: m, minutes: m,
  h, hour: h, hours: h,
  d, day: d, days: d,
  w, week: w, weeks: w
};

// Takes a remaining time string (e.g. 1d 5h 10s) and
// converts it to the amount of time it represents in seconds.
export function toSeconds(time: string): number {
  let seconds = 0;
  for (const [value, unit] of time.gsub(" ", "")[0].gmatch("(%d+)(%a)")) {
    const timeUnit = <keyof typeof timePatterns>unit;
    const figure = <number>value;
    seconds += figure * timePatterns[timeUnit];
  }

  return seconds;
}

// Takes a time in seconds (e.g. 310) and converts
// it to a remaining time string (e.g. 5m 10s)
export function toRemainingTime(seconds: number): string {
  const dayDivisor = 60 * 60 * 24;
  const days = floor(seconds / dayDivisor);
  seconds %= dayDivisor;

  const hourDivisor = 60 * 60;
  const hours = floor(seconds / hourDivisor);
  seconds %= hourDivisor;

  const minuteDivisor = 60;
  const minutes = floor(seconds / minuteDivisor);
  seconds %= minuteDivisor;

  let remainingTime = "";
  if (days > 0)
    remainingTime += "%dd ".format(days);
  if (hours > 0)
    remainingTime += "%dh ".format(hours);
  if (minutes > 0)
    remainingTime += "%dm ".format(minutes);
  if (seconds > 0)
    remainingTime += "%ds ".format(seconds);

  return StringUtils.trim(remainingTime);
}

export function toLongRemainingTime(seconds: number): string {
  const hours = floor(seconds / 3600);
  const minutes = floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return "%02d:%02d:%02d".format(hours, minutes, remainingSeconds);
}

export function commaFormat(n: number | string): string {
  let formatted = tostring(n);
  const parts: string[] = [];

  while (formatted.size() > 3) {
    parts.insert(0, formatted.sub(-3));
    formatted = formatted.sub(1, -4);
  }

  parts.insert(0, formatted);
  return parts.join(",");
}

const suffixes = <const>["K", "M", "B", "T", "Q"];
export function toSuffixedNumber(n: number): string {
  if (n < 100_000)
    return commaFormat(n);

  const index = floor(log(n, 1e3)) - 1;
  const divisor = 10 ** ((index + 1) * 3);
  const [ baseNumber ] = "%.1f".format(floor(n / divisor)).gsub("%.?0+$", "");
  return baseNumber + (index < 0 ? "" : suffixes[index]);
}

export function parseSuffixedNumber(suffixed: string): number {
  const match = suffixed.gsub(",", "")[0].match("^([0-9,.]+)([KMBT]?)$");
  if (!match)
    throw new Exception("InvalidSuffixedNumber", "Invalid suffixed number format");

  let numberPart = tostring(match[0]);
  const suffix = tostring(match[1]);

  if (suffix && suffix !== "" && suffix !== "nil") {
    const index = (<readonly string[]>suffixes).indexOf(suffix.lower());
    if (index === -1)
      throw new Exception("InvalidNumberSuffix", "Invalid suffix in suffixed number");

    const multiplier = 10 ** ((index + 1) * 3);
    numberPart = tostring(tonumber(numberPart)! * multiplier);
  }

  return tonumber(numberPart)!;
}