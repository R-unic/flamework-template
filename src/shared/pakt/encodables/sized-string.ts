import { slice } from "shared/utility/array";
import { isUShort } from "shared/utility/numbers";
import type { BinaryReader } from "shared/classes/binary-reader";

import { Number } from "./number";
import { Encodable, EncodableKind, InvalidEncodableException } from "../encodable";

// max length 2 ^ 16 (65536)
export class SizedString extends Encodable {
  public static readonly kind = EncodableKind.SizedString;

  public constructor(
    public readonly value: string,
    private readonly sizeInBytes: ushort = value.size()
  ) { super(); }

  public static parse(reader: BinaryReader): string {
    const kind = reader.readByte();
    const length = Number.parse(reader);
    const value = reader.readString(length);
    const sizedString = new SizedString(value, length);
    sizedString.validate();

    return value;
  }

  public encode(): Buffer {
    const lengthBytes = new Number(this.sizeInBytes, 2).encode();
    const characters = this.value.split("");
    const stringBytes = characters.map<byte>(char => utf8.codepoint(char)[0]);
    const paddedStringBytes = slice(stringBytes, 0, this.sizeInBytes);

    return [
      SizedString.kind,
      ...lengthBytes,
      ...paddedStringBytes
    ];
  }

  public size(): number {
    return 1 + 2 + this.sizeInBytes;
  }

  public validate(): void {
    this.validateExpression(isUShort(this.sizeInBytes), "length");
    this.validateExpression(this.value.size() === this.sizeInBytes, "value");
  }

  protected validateExpression<T extends boolean>(expression: T, fieldName: string): void {
    if (expression) return;
    throw new InvalidEncodableException("SizedString", fieldName);
  }
}