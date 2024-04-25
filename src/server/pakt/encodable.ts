import type { BinaryReader } from "shared/classes/binary-reader";
import Log from "shared/logger";

export class InvalidEncodableException extends Log.Exception {
  public constructor(encodableName: string, fieldName: string) {
    super("Pakt.InvalidEncodable", `Failed to validate Encodable "${encodableName}" on field "${fieldName}"`);
  }
}

export enum EncodableKind {
  PacketHeader,
  PacketFooter,
  Packet,
  Number,
  SizedString,
  SizedArray
}

export type StaticEncodable = typeof Encodable;

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