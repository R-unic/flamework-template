import { Size } from "shared/utility/numbers";
import type { BinaryReader } from "shared/classes/binary-reader";

import { Encodable, EncodableKind, InvalidEncodableException } from "../encodable";

function createBufferFromNumber(value: number, sizeInBytes: byte): Buffer {
  const buffer: Buffer = [];
  for (let i = 0; i < sizeInBytes; i++)
    buffer.push((value >> (i * Size.byte)) & 0xFF);

  return buffer;
}

function createNumberFromBuffer<T extends number = number>(buffer: Buffer): T {
  let value = 0;
  for (const [i, byte] of pairs(buffer)) {
    value |= byte << ((i - 1) * Size.byte);
  }

  return <T>value;
}

export class Number<T extends number = number> extends Encodable {
  public static readonly kind = EncodableKind.Number;

  public constructor(
    public readonly value: T,
    public readonly sizeInBytes: byte
  ) { super(); }

  public static parse<T extends number = number>(reader: BinaryReader): T {
    const _ = reader.readByte();
    const sizeInBytes = reader.readByte();
    const bytes = reader.readBytes(sizeInBytes);
    const value = createNumberFromBuffer<T>(bytes);
    const number = new Number<T>(value, sizeInBytes);
    number.validate();

    return number.value;
  }

  public encode(): Buffer {
    const numberBytes: Buffer = [
      Number.kind,
      ...createBufferFromNumber(this.sizeInBytes, 1),
      ...createBufferFromNumber(this.value, this.sizeInBytes)
    ];

    return numberBytes;
  }

  public validate(): void {

  }

  protected validateExpression<T extends boolean>(expression: T, fieldName: string): void {
    if (expression) return;
    throw new InvalidEncodableException("Number", fieldName);
  }
}