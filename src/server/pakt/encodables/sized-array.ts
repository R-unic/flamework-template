import { flatten, slice } from "shared/utility/array";
import { isUShort } from "shared/utility/numbers";
import { Encodable, EncodableKind, Encodables, InvalidEncodableException } from "../encodable";
import type { BinaryReader } from "shared/classes/binary-reader";
import { Number } from "./number";
import Log from "shared/logger";

const FillerBytes: Record<string, Buffer> = {
  ElementSeparator: [0xAF, 0xCB],
  EndOfArray: [0xDA, 0xAE, 0xEF]
}

// max length 2 ^ 8 (256)
export class SizedArray extends Encodable {
  public static readonly kind = EncodableKind.SizedArray;

  public constructor(
    private readonly value: Encodable[],
    private readonly length: byte = value.size()
  ) { super(); }

  public static parse<T extends defined = defined>(reader: BinaryReader): T[] {
    const value: T[] = [];
    const length = Number.parse(reader);
    for (let i = 0; i < length; i++) {
      const kind = Number.parse<EncodableKind>(reader);
      if (kind === EncodableKind.Packet)
        throw new Log.Exception("InvalidArrayEncodable", "Attempt to parse an element of type Packet from SizedArray encodable")

      const StaticEncodable = Encodables.find(encodable => encodable.kind === kind)!;
      const parsedEncodable = StaticEncodable.parse(reader);
      value.push(<T>parsedEncodable);

      const fillerBytes = i === length - 1 ? FillerBytes.EndOfArray : FillerBytes.ElementSeparator;
      const parsedFillerBytes = reader.readBytes(fillerBytes.size());
      if (fillerBytes !== parsedFillerBytes)
        throw new Log.Exception("InvalidArrayEncodable", `Correct filler bytes is ${i === length - 1 ? "EndOfArray" : "ElementSeparator"}, got ${parsedFillerBytes}`);

    }

    // // validation
    // this.validateExpression(isUShort(this.length), "length");
    // this.validateExpression(this.value.size() === this.length, "value");
    // for (const encodable of this.value)
    //   encodable.validate();

    return value;
  }

  public encode(): Buffer {
    const lengthBytes = new Number(this.length, 1).encode();
    const arrayBytes = flatten(this.value.map((encodable, i) => {
      const encodableBytes = encodable.encode();
      const fillerBytes = i === this.length - 1 ? FillerBytes.EndOfArray : FillerBytes.ElementSeparator;
      for (const byte of fillerBytes)
        encodableBytes.push(byte);

      return encodableBytes;
    }));

    const paddedArrayBytes = slice(arrayBytes, 0, this.length);
    return [
      ...new Number(SizedArray.kind, 1).encode(),
      ...lengthBytes,
      ...paddedArrayBytes
    ];
  }

  public validate(): void {

  }

  protected validateExpression<T extends boolean>(expression: T, fieldName: string): void {
    if (expression) return;
    throw new InvalidEncodableException("SizedArray", fieldName);
  }
}