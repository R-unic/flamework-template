import type { BinaryReader } from "shared/classes/binary-reader";

import { Encodable, EncodableKind, InvalidEncodableException } from "../encodable";

export class Boolean extends Encodable {
  public static readonly kind = EncodableKind.Boolean;

  public constructor(
    public readonly value: boolean
  ) { super(); }

  public static parse(reader: BinaryReader): boolean {
    const _ = reader.readByte();
    const value = reader.readByte();
    const bool = new Boolean(value === 1);
    bool.validate();

    return bool.value;
  }

  public encode(): Buffer {
    const numberBytes: Buffer = [
      Boolean.kind,
      this.value ? 1 : 0
    ];

    return numberBytes;
  }

  public size(): number {
    return 1 + 1;
  }

  public validate(): void {

  }

  protected validateExpression<T extends boolean>(expression: T, fieldName: string): void {
    if (expression) return;
    throw new InvalidEncodableException("Number", fieldName);
  }
}