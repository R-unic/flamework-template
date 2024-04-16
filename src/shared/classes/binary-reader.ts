import { Size } from "shared/utility/number-size";
import { slice } from "shared/utility/array";
import Log from "shared/logger";

class MissingByteException extends Log.Exception {
  public constructor() {
    super("BinaryReader.MissingByte", "Attempted to read byte that did not exist. This is caused by reading past the buffers extents.");
  }
}

export class BinaryReader {
  private offset = 0;
  private bitOffset = 0;

  public constructor(
    private readonly buffer: Buffer = []
  ) { }

  public readInt(): int {
    const value = this.peekByte() | (this.peekByte(1) << 8) |
      (this.peekByte(2) << 16) | (this.peekByte(3) << 24);

    this.offset += 4;
    this.bitOffset = 0;
    return value;
  }

  public readUInt(): uint {
    return this.readInt();
  }

  public readShort(): short {
    const value = this.peekByte() | (this.peekByte(2) << 8);
    this.offset += 2;
    this.bitOffset = 0;
    return value;
  }

  public readUShort(): ushort {
    return this.readShort();
  }

  public readByte(): byte {
    const value = this.peekByte();
    this.offset += 1;
    this.bitOffset = 0;
    return value;
  }

  public readSByte(): sbyte {
    const value = this.peekByte() << 24 >> 24; // Sign extend
    this.offset += 1;
    this.bitOffset = 0;
    return value;
  }

  public readFloat(): float {
    const value = this.peekByte()
      | (this.peekByte(1) << 8)
      | (this.peekByte(2) << 16)
      | (this.peekByte(3) << 24);

    this.offset += 4;
    this.bitOffset = 0;

    const sign = (value & 0x80000000) ? -1 : 1;
    const exponent = ((value >> 23) & 0xFF) - 127;
    const mantissa = (value & 0x7FFFFF) | 0x800000;
    return sign * mantissa * 2 ** (exponent - 23);
  }

  public readHFloat(): hfloat {
    const value = this.buffer[this.offset] | (this.buffer[this.offset + 1] << 8);
    this.offset += 2;
    this.bitOffset = 0;
    return value / 100.0;
  }

  public readString(length: number): string {
    return utf8.char(...this.readBytes(length));
  }

  public readBytes(amount: number): Buffer {
    const bytes = slice(this.buffer, this.offset, this.offset + amount);
    this.offset += amount;
    this.bitOffset = 0;
    return bytes;
  }

  public readBits(amount: number): Buffer {
    const result: Buffer = [];
    let currentByte = 0;
    let remainingBits = amount;

    while (remainingBits > 0) {
      const bitsToRead = math.min(Size.byte() - this.bitOffset, remainingBits);
      const mask = (1 << bitsToRead) - 1;
      const bits = (this.peekByte() >> (Size.byte() - this.bitOffset - bitsToRead)) & mask;
      currentByte = (currentByte << bitsToRead) | bits;

      remainingBits -= bitsToRead;
      this.bitOffset += bitsToRead;

      if (this.bitOffset === Size.byte()) {
        result.push(currentByte);
        currentByte = 0;
        this.offset++;
        this.bitOffset = 0;
      }
    }

    // If there are remaining bits, add the partially assembled byte to the result
    if (remainingBits > 0)
      result.push(currentByte << (Size.byte() - this.bitOffset - remainingBits));

    return result;
  }

  private peekByte(extraOffset = 0): byte {
    const byte: Maybe<byte> = this.buffer[this.offset + extraOffset];
    if (byte === undefined)
      throw new MissingByteException;

    return byte;
  }

  public seek(offset: number): void {
    this.offset = offset;
  }

  public getPosition(): number {
    return this.offset;
  }
}