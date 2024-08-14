const { ceil, abs } = math;

namespace Size {
  export const byte = 8;
  export const short = 16;
  export const int = 32;
  export const long = 64;
  export const bigint = 128;

  export function inBytes(n: number): number {
    const positiveNum = abs(n);
    let temp = positiveNum;
    let bits = 0;

    while (temp !== 0 && bits < 128) {
      temp >>= 1; // Right shift by 1 bit
      bits++;
    }

    return ceil(bits / 8);
  }

  export function isUnsigned(n: number): boolean {
    return n >= 0;
  }

  export function isByte(n: number): boolean {
    return isUnsigned(n) && n <= 0XFF;
  }

  export function isSByte(n: number): boolean {
    return n >= -0x80 && n <= 0X7F;
  }

  export function isShort(n: number): boolean {
    return n >= -0x8000 && n <= 0x7FFF;
  }

  export function isUShort(n: number): boolean {
    return isUnsigned(n) && n <= 0xFFFF;
  }

  export function isInt(n: number): boolean {
    return n >= -0x80000000 && n <= 0x7FFFFFFF;
  }

  export function isUInt(n: number): boolean {
    return isUnsigned(n) && n <= 0xFFFFFFFF;
  }
}

export = Size;