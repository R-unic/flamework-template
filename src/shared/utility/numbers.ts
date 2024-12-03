const { floor, abs, clamp } = math;

export const isNaN = (n: number) => n !== n;
export const isEven = (n: number) => n % 2 === 0;

/**
 * Clamps `n` between `-limit` and `limit`, inclusive
 */
export function doubleSidedLimit(n: number, limit: number): number {
  return clamp(n, -limit, limit);
}

/**
 * Returns 0 if `n` is close enough to 0 by `epsilon`
 * @param n
 * @param epsilon
 */
export function zeroIfClose(n: number, epsilon = 0.001): number {
  return abs(n) < epsilon ? 0 : n;
}

/**
 * Rounds `n` to the nearest 5 or 10
 * @example toNearestFiveOrTen(7) // 10
 */
export function toNearestFiveOrTen(n: number): number {
  let result = floor(n / 5 + 0.5) * 5;
  if (result % 10 !== 0)
    result += 10 - result % 10;

  return result;
}

/**
 * Rounds `n` to the nearest `digits` digits
 * @example roundDecimal(10.45687, 2) // 10.46
 */
export function roundDecimal(n: number, digits = 0): number {
  const mult = 10 ** digits;
  return floor(n * mult + 0.5) / mult;
}