import { slice } from "shared/utility/array";
import { Size } from "shared/utility/number-size";

export class BinaryReader {
  private buffer: byte[];
  private offset: number;
  private bitOffset: number;

  public constructor(buffer: byte[]) {
    this.buffer = buffer;
    this.offset = 0;
    this.bitOffset = 0;
  }

  public readByte(): byte {
    const value = this.buffer[this.offset];
    this.offset += 1;
    this.bitOffset = 0;
    return value;
  }

  public readShort(): short {
    const value = this.buffer[this.offset] | (this.buffer[this.offset + 1] << 8);
    this.offset += 2;
    this.bitOffset = 0;
    return value;
  }

  public readInt(): int {
    const value = this.buffer[this.offset] | (this.buffer[this.offset + 1] << 8) |
      (this.buffer[this.offset + 2] << 16) | (this.buffer[this.offset + 3] << 24);

    this.offset += 4;
    this.bitOffset = 0;
    return value;
  }

  public readString(length: number): string {
    return utf8.char(...this.readBytes(length));
  }

  public readBytes(amount: number): byte[] {
    const bytes = slice(this.buffer, this.offset, this.offset + amount);
    this.offset += amount;
    this.bitOffset = 0;
    return bytes;
  }

  public readBits(amount: number): byte[] {
    const result: byte[] = [];
    let bitsCollected = 0;

    while (bitsCollected < amount) {
      const offset = Size.byte() - this.bitOffset;
      const bitsRemaining = amount - bitsCollected;
      const bitsToRead = math.min(bitsRemaining, offset);
      print(bitsToRead)
      const byte = this.buffer[this.offset];
      const mask = (1 << bitsToRead) - 1;
      const bits = (byte >> (offset - bitsToRead)) & mask;
      result.push(bits << (bitsRemaining - bitsToRead));

      this.bitOffset += bitsToRead;
      bitsCollected += bitsToRead;

      if (this.bitOffset === Size.byte()) {
        this.offset++;
        this.bitOffset = 0;
      }
    }

    return result;
  }

  public seek(offset: number): void {
    this.offset = offset;
  }

  public getPosition(): number {
    return this.offset;
  }
}