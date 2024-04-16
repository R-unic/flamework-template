import { Size } from "shared/utility/number-size";
import { isShort } from "shared/utility/numbers";
import { Number } from "./number";
import { Encodable, InvalidEncodableException } from "../encodable";
import type { BinaryReader } from "shared/classes/binary-reader";

export class PacketHeader extends Encodable {
  public static readonly size = Size.short();

  /**
   * @param payloadSize In bytes
   */
  public constructor(
    public readonly payloadSize: byte
  ) { super(); }


  public static parse(reader: BinaryReader): PacketHeader {
    const packetLength = reader.readByte();
    const header = new PacketHeader(packetLength);
    header.validate();

    return header;
  }

  public encode(): Buffer {
    const packetLengthBytes = new Number(this.payloadSize, 1).encode();
    const header: Buffer = [
      ...packetLengthBytes
    ];

    return header;
  }

  public validate(): void {
    this.validateExpression(isShort(this.payloadSize), "packetLength");
  }

  protected validateExpression<T extends boolean>(expression: T, fieldName: string): void {
    if (expression) return;
    throw new InvalidEncodableException("PacketHeader", fieldName);
  }
}