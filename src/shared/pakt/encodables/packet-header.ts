import { Size } from "shared/utility/numbers";
import { isShort } from "shared/utility/numbers";
import type { BinaryReader } from "shared/classes/binary-reader";

import { Number } from "./number";
import { Encodable, EncodableKind, InvalidEncodableException } from "../encodable";

export class PacketHeader extends Encodable {
  public static readonly kind = EncodableKind.PacketHeader;

  /**
   * @param payloadSize In bytes
   */
  public constructor(
    public readonly payloadSize: ushort
  ) { super(); }

  public static parse(reader: BinaryReader): PacketHeader {
    const kind = reader.readByte();
    const payloadSize = Number.parse(reader);
    const header = new PacketHeader(payloadSize);
    header.validate();

    return header;
  }

  public encode(): Buffer {
    const payloadSizeBytes = new Number(this.payloadSize, 2).encode();
    const header: Buffer = [
      PacketHeader.kind,
      ...payloadSizeBytes
    ];

    return header;
  }

  public size(): number {
    return 1 + 2; // just a byte for the kind, and a short to represent payloadSize
  }

  public validate(...args: unknown[]): void {
    this.validateExpression(isShort(this.payloadSize), "payloadSize");
  }

  protected validateExpression<T extends boolean>(expression: T, fieldName: string): void {
    if (expression) return;
    throw new InvalidEncodableException("PacketHeader", fieldName);
  }
}