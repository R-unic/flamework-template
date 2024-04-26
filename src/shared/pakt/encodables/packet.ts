import { BinaryReader } from "shared/classes/binary-reader";

import { PacketHeader } from "./packet-header";
import { PacketFooter } from "./packet-footer";
import { Number } from "./number";
import { SizedString } from "./sized-string";
import { SizedArray } from "./sized-array";
import { Encodable, EncodableKind, InvalidEncodableException, type StaticEncodable, type EncodableWrappedValue } from "../encodable";

export class Packet extends Encodable {
  public static readonly kind = EncodableKind.Packet;

  public constructor(
    public readonly header: PacketHeader,
    public readonly payload: EncodableWrappedValue[],
    public readonly footer: PacketFooter
  ) { super(); }

  public static parse<T extends defined = defined>(reader: BinaryReader, allEncodables: StaticEncodable[]): Packet {
    const kind = reader.readByte();
    const header = PacketHeader.parse(reader);
    const payload = SizedArray.parse<T>(reader, allEncodables);
    const footer = PacketFooter.parse(reader);
    const packet = new Packet(header, <EncodableWrappedValue[]><unknown>payload, footer);
    packet.validate(payload);

    return packet;
  }

  public encode(): Buffer {
    const packet: Buffer = [Packet.kind];
    for (const byte of this.header.encode())
      packet.push(byte);
    for (const byte of new SizedArray(this.payload).encode())
      packet.push(byte);
    for (const byte of this.footer.encode())
      packet.push(byte);

    return packet;
  }

  public size(): number {
    return 1 + this.header.size() + this.header.payloadSize + this.footer.size();
  }

  public validate(...args: unknown[]): void {
    const [parsedPayload] = args;
    this.header.validate();
    this.validatePayload(<defined[]>parsedPayload);
    this.footer.validate();
  }

  protected validateExpression<T extends boolean>(expression: T, fieldName: string): void {
    if (expression) return;
    throw new InvalidEncodableException("Packet", fieldName);
  }

  private validatePayload(parsedPayload: defined[]): void {
    this.validateExpression(parsedPayload.every((v, i) => v === this.payload[i]), "payload");
  }
}

export const BaseEncodables = [
  PacketHeader,
  PacketFooter,
  Packet,
  Number,
  SizedString,
  SizedArray
].map<StaticEncodable>(t => <StaticEncodable>t);