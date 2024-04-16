import Log from "shared/logger";

export class InvalidEncodableException extends Log.Exception {
  public constructor(encodableName: string, fieldName: string) {
    super("Pakt.InvalidEncodable", `Failed to validate Encodable "${encodableName}" on field "${fieldName}"`);
  }
}

export abstract class Encodable {
  public abstract encode(): Buffer;
  public abstract validate(): void;
  protected abstract validateExpression<T extends boolean>(expression: T, fieldName: string): void;

  protected shift(byte: byte, offset: short, size: byte = 8) {
    return byte << (offset * size);
  }
}