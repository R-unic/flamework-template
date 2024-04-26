import Log from "shared/logger";

const { floor, ceil, log, abs, clamp } = math;

export const isNaN = (n: number) => n !== n;

export namespace Size {
  export const byte = 8;
  export const short = 16;
  export const int = 32;
  export const long = 64;
  export const bigint = 128;

  export function inBytes(n: number): byte {
    const positiveNum = abs(n);
    let temp = positiveNum;
    let bits = 0;

    while (temp !== 0 && bits < 128) {
      temp >>= 1; // Right shift by 1 bit
      bits++;
    }

    return ceil(bits / 8);
  }
}

export function isUnsigned(n: number): boolean {
  return n >= 0;
}

export function isByte(n: number): n is byte {
  return isUnsigned(n) && n <= 0XFF;
}

export function isSByte(n: number): n is sbyte {
  return n >= -0x80 && n <= 0X7F;
}

export function isShort(n: number): n is short {
  return n >= -0x8000 && n <= 0x7FFF;
}

export function isUShort(n: number): n is ushort {
  return isUnsigned(n) && n <= 0xFFFF;
}

export function isInt(n: number): n is int {
  return n >= -0x80000000 && n <= 0x7FFFFFFF;
}

export function isUInt(n: number): n is uint {
  return isUnsigned(n) && n <= 0xFFFFFFFF;
}

export function doubleSidedLimit(n: number, limit: number) {
  return clamp(n, -limit, limit);
}

/**
 * Returns 0 if the number is close enough to 0 by `epsilon`
 * @param n
 * @param epsilon
 */
export function flattenNumber(n: number, epsilon = 0.001): number {
  return abs(n) < epsilon ? 0 : n;
}

export function toNearestFiveOrTen(n: number): number {
  let result = floor(n / 5 + 0.5) * 5;
  if (result % 10 !== 0)
    result += 10 - result % 10;

  return result;
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

  const index = floor(log(n, 1000)) - 1;
  const divisor = 10 ** ((index + 1) * 3);
  const [baseNumber] = "%.1f".format(floor(n / divisor)).gsub("%.?0+$", "");
  return baseNumber + (index < 0 ? "" : suffixes[index]);
}

export function parseSuffixedNumber(suffixed: string): number {
  const match = suffixed.gsub(",", "")[0].match("^([0-9,.]+)([KMBT]?)$");
  if (!match)
    throw new Log.Exception("InvalidSuffixedNumber", "Invalid suffixed number format");

  let numberPart = tostring(match[0]);
  const suffix = tostring(match[1]);

  if (suffix && suffix !== "" && suffix !== "nil") {
    const index = (<readonly string[]>suffixes).indexOf(suffix.lower());
    if (index === -1)
      throw new Log.Exception("InvalidNumberSuffix", "Invalid suffix in suffixed number");

    const multiplier = 10 ** ((index + 1) * 3);
    numberPart = tostring(tonumber(numberPart)! * multiplier);
  }

  return tonumber(numberPart)!;
}
