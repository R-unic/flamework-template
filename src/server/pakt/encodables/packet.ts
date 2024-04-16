import { BinaryReader } from "shared/classes/binary-reader";
import { PacketHeader } from "./packet-header";
import { PacketFooter, SESSION_ID_SIZE } from "./packet-footer";
import { Number } from "./number";
import { Encodable, EncodableKind, InvalidEncodableException } from "../encodable";

export type PayloadValidator = (payload: Buffer) => void;

export class Packet extends Encodable {
  public static readonly kind = EncodableKind.Packet;
  public static readonly size = SESSION_ID_SIZE + PacketHeader.size + PacketFooter.size;

  public constructor(
    public readonly header: PacketHeader,
    public readonly payload: Buffer,
    public readonly footer: PacketFooter,
    private readonly validatePayload: PayloadValidator
  ) { super(); }

  public static parse(reader: BinaryReader, validatePayload: PayloadValidator): Packet {
    const kind = Number.parse(reader);
    const header = PacketHeader.parse(reader);
    const payload = reader.readBytes(header.payloadSize);
    const footer = PacketFooter.parse(reader);
    const packet = new Packet(header, payload, footer, validatePayload);
    packet.validate();

    return packet;
  }

  public encode(): Buffer {
    const packet: Buffer = [...new Number(Packet.kind, 1).encode()];
    for (const byte of this.header.encode())
      packet.push(byte);
    for (const byte of this.payload)
      packet.push(byte);
    for (const byte of this.footer.encode())
      packet.push(byte);

    return packet;
  }

  public validate(): void {
    this.header.validate();
    this.validatePayload(this.payload);
    this.footer.validate();
  }

  protected validateExpression<T extends boolean>(expression: T, fieldName: string): void {
    if (expression) return;
    throw new InvalidEncodableException("Packet", fieldName);
  }
}