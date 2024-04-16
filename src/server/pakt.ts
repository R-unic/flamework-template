import { Networking } from "@flamework/networking";
import { HttpService as HTTP } from "@rbxts/services";
import { BinaryReader } from "shared/classes/binary-reader";
import { InvalidSerializableException } from "shared/exceptions";
import { Size } from "shared/utility/number-size";
import { slice } from "shared/utility/array";
import { isShort } from "shared/utility/numbers";

const PAKT_SESSION_ID = HTTP.GenerateGUID(false);
const SESSION_ID_SIZE = PAKT_SESSION_ID.size() * Size.byte();

namespace Pakt {
  abstract class Serializable {
    public abstract serialize(): Buffer;
    public abstract validate(): void;
    protected abstract validateExpression<T extends boolean>(expression: T, fieldName: string): void;

    protected shift(byte: byte, offset: short, size: byte = 8) {
      return byte << (offset * size);
    }
  }

  export class PacketHeader extends Serializable {
    public static readonly size = Size.short();

    /**
     * @param packetLength In bits
     */
    public constructor(
      public readonly packetLength: short
    ) { super(); }

    public static parse(reader: BinaryReader): PacketHeader;
    public static parse(serialized: Buffer): PacketHeader;
    public static parse(serialized: Buffer | BinaryReader): PacketHeader {
      const reader = serialized instanceof BinaryReader ? serialized : new BinaryReader(serialized);
      const packetLength = reader.readShort();
      const header = new PacketHeader(packetLength);
      header.validate();

      return header;
    }

    public serialize(): Buffer {
      const header: Buffer = [];

      // Convert packetLength to little-endian
      header.push(this.packetLength & 0xFF);
      header.push((this.packetLength >> 8) & 0xFF);
      header.push((this.packetLength >> 16) & 0xFF);
      header.push((this.packetLength >> 24) & 0xFF);

      return header;
    }

    public validate(): void {
      this.validateExpression(isShort(this.packetLength), "packetLength");
    }

    protected validateExpression<T extends boolean>(expression: T, fieldName: string): void {
      if (expression) return;
      throw new InvalidSerializableException("PacketHeader", fieldName);
    }
  }

  export class PacketFooter extends Serializable {
    public static readonly size = SESSION_ID_SIZE;

    public constructor(
      public readonly sessionID = PAKT_SESSION_ID
    ) { super(); }

    public static parse(reader: BinaryReader): PacketFooter;
    public static parse(serialized: Buffer): PacketFooter;
    public static parse(serialized: Buffer | BinaryReader): PacketFooter {
      const reader = serialized instanceof BinaryReader ? serialized : new BinaryReader(serialized);
      const sessionID = reader.readString(PAKT_SESSION_ID.size());
      print(sessionID)
      const footer = new PacketFooter(sessionID);
      footer.validate();

      return footer;
    }

    public serialize(): Buffer {
      const sessionIDCharacters = this.sessionID.split("");
      const sessionIDBytes = sessionIDCharacters.map<byte>(char => utf8.codepoint(char)[0]);
      const paddedSessionID = slice(sessionIDBytes, 0, 36);
      const header: Buffer = [...paddedSessionID];

      return header;
    }

    public validate(): void {
      print("correct session id", PAKT_SESSION_ID)
      print("parsed session id", this.sessionID)
      this.validateExpression(this.sessionID === PAKT_SESSION_ID, "sessionID");
    }

    protected validateExpression<T extends boolean>(expression: T, fieldName: string): void {
      if (expression) return;
      throw new InvalidSerializableException("PacketFooter", fieldName);
    }
  }

  type PayloadValidator = (payload: Buffer) => void;

  export class Packet extends Serializable {
    public static readonly size = SESSION_ID_SIZE + PacketHeader.size + PacketFooter.size;

    public constructor(
      public readonly header: PacketHeader,
      public readonly payload: Buffer,
      public readonly footer: PacketFooter,
      private readonly validatePayload: PayloadValidator
    ) { super(); }

    public static parse(reader: BinaryReader, validatePayload: PayloadValidator): Packet;
    public static parse(serialized: Buffer, validatePayload: PayloadValidator): Packet;
    public static parse(serialized: Buffer | BinaryReader, validatePayload: PayloadValidator): Packet {
      const reader = serialized instanceof BinaryReader ? serialized : new BinaryReader(serialized);
      const headerBytes = reader.readBits(PacketHeader.size);
      const header = PacketHeader.parse(headerBytes);
      const payload = reader.readBits(header.packetLength);
      const footerBytes = reader.readBits(PacketFooter.size);
      const footer = PacketFooter.parse(footerBytes);
      const packet = new Packet(header, payload, footer, validatePayload);
      packet.validate();

      return packet;
    }

    public serialize(): Buffer {
      const packet: Buffer = [];
      for (const byte of this.header.serialize())
        packet.push(byte);
      for (const byte of this.payload)
        packet.push(byte);
      for (const byte of this.footer.serialize())
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
      throw new InvalidSerializableException("Packet.Payload", fieldName);
    }
  }
}

export = Pakt;