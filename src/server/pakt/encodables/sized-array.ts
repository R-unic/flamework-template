import { flatten } from "shared/utility/array";
import type { BinaryReader } from "shared/classes/binary-reader";
import repr from "shared/utility/repr";
import Log from "shared/logger";

import { Number } from "./number";
import { Encodable, EncodableKind, InvalidEncodableException, type StaticEncodable } from "../encodable";

const FillerBytes: Record<string, Buffer> = {
  ElementSeparator: [0xAF, 0xCB],
  EndOfArray: [0xDA, 0xAE, 0xEF]
}

// max length 2 ^ 8 (256)
export class SizedArray extends Encodable {
  public static readonly kind = EncodableKind.SizedArray;

  public constructor(
    public readonly value: Encodable[],
    private readonly length: byte = value.size()
  ) { super(); }

  public static parse<T extends defined = defined>(reader: BinaryReader, allEncodables: StaticEncodable[]): T[] {
    const _ = reader.readByte();
    const value: T[] = [];
    const length = Number.parse(reader);
    for (let i = 0; i < length; i++) {
      const kind = reader.peekByte();
      if (kind === EncodableKind.Packet)
        throw new Log.Exception("InvalidArrayEncodable", "Attempt to parse an element of type Packet from SizedArray encodable");
      else if (kind === EncodableKind.PacketHeader)
        throw new Log.Exception("InvalidArrayEncodable", "Attempt to parse an element of type PacketHeader from SizedArray encodable");
      else if (kind === EncodableKind.PacketFooter)
        throw new Log.Exception("InvalidArrayEncodable", "Attempt to parse an element of type PacketFooter from SizedArray encodable");

      const StaticEncodable = allEncodables.find(encodable => encodable.kind === kind)!;
      if (StaticEncodable === undefined)
        throw new Log.Exception("FailedToFindEncodable", `Could not find encodable kind with index ${kind} (${EncodableKind[kind]})`)

      const parsedEncodable = StaticEncodable.parse(reader);
      value.push(<T>parsedEncodable);

      const fillerBytes = i === length - 1 ? FillerBytes.EndOfArray : FillerBytes.ElementSeparator;
      const parsedFillerBytes = reader.readBytes(fillerBytes.size());
      if (!fillerBytes.every((byte, i) => byte === parsedFillerBytes[i]))
        throw new Log.Exception("InvalidArrayEncodable", `Correct filler bytes is ${i === length - 1 ? "EndOfArray" : "ElementSeparator"} (${repr(fillerBytes)}), got ${repr(parsedFillerBytes)}`);
    }

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

    return [
      SizedArray.kind,
      ...lengthBytes,
      ...arrayBytes
    ];
  }

  public validate(): void {

  }

  protected validateExpression<T extends boolean>(expression: T, fieldName: string): void {
    if (expression) return;
    throw new InvalidEncodableException("SizedArray", fieldName);
  }
}