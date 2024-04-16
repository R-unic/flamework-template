import { PacketHeader } from "./encodables/packet-header";
import { PacketFooter } from "./encodables/packet-footer";
import { Packet } from "./encodables/packet";
import { Number } from "./encodables/number";
import { SizedArray } from "./encodables/sized-array";
import { SizedString } from "./encodables/sized-string";
import type { BinaryReader } from "shared/classes/binary-reader";
import Log from "shared/logger";

export class InvalidEncodableException extends Log.Exception {
  public constructor(encodableName: string, fieldName: string) {
    super("Pakt.InvalidEncodable", `Failed to validate Encodable "${encodableName}" on field "${fieldName}"`);
  }
}

export const enum EncodableKind {
  PacketHeader,
  PacketFooter,
  Packet,
  Number,
  SizedString,
  SizedArray
}

export abstract class Encodable {
  public static readonly kind: EncodableKind;

  public static parse(reader: BinaryReader, ...args: unknown[]): defined { return <defined><unknown>undefined; };

  public abstract encode(): Buffer;
  public abstract validate(): void;
  protected abstract validateExpression<T extends boolean>(expression: T, fieldName: string): void;

  protected shift(byte: byte, offset: short, size: byte = 8) {
    return byte << (offset * size);
  }
}

type StaticEncodable = typeof Encodable;

export const Encodables = [
  PacketHeader,
  PacketFooter,
  Packet,
  Number,
  SizedString,
  SizedArray
].map<StaticEncodable>(t => <StaticEncodable>t);