import { Size } from "shared/utility/number-size";
import { Encodable, InvalidEncodableException } from "../encodable";
import type { BinaryReader } from "shared/classes/binary-reader";

function createBufferFromNumber(value: number, sizeInBytes: byte): Buffer {
  const buffer: Buffer = [];
  for (let i = 0; i < sizeInBytes; i++)
    buffer.push((value >> (i * Size.byte())) & 0xFF);

  return buffer;
}

function createNumberFromBuffer<T extends number = number>(buffer: Buffer): T {
  let value = 0;
  for (const [i, byte] of pairs(buffer))
    value |= byte << (i * Size.byte());

  return <T>value;
}

export class Number<T extends number = number> extends Encodable {
  public constructor(
    private readonly value: T,
    private readonly sizeInBytes: byte
  ) { super(); }

  public static parse<T extends number = number>(reader: BinaryReader, sizeInBytes: byte): T {
    const bytes = reader.readBytes(sizeInBytes);
    const value = createNumberFromBuffer<T>(bytes);
    const number = new Number<T>(value, sizeInBytes);
    number.validate();

    return number.value;
  }

  public encode(): Buffer {
    return createBufferFromNumber(this.value, this.sizeInBytes);
  }

  public validate(): void {

  }

  protected validateExpression<T extends boolean>(expression: T, fieldName: string): void {
    if (expression) return;
    throw new InvalidEncodableException("Number", fieldName);
  }
}