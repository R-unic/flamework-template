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
  Boolean,
  SizedString,
  SizedArray
}

export type StaticEncodable = typeof Encodable;

export type EncodableWrappedValue<T extends unknown = unknown> = Encodable & {
  value: T;
};

export abstract class Encodable {
  public static readonly kind: EncodableKind;

  public static parse(reader: BinaryReader, ...args: unknown[]): defined { return <defined><unknown>undefined; };

  public abstract encode(): Buffer;
  public abstract validate(): void;
  public abstract size(): number;
  protected abstract validateExpression<T extends boolean>(expression: T, fieldName: string): void;

  public static(): StaticEncodable {
    return Encodable;
  }

  protected shift(byte: byte, offset: short, size: byte = 8) {
    return byte << (offset * size);
  }
}