import { Networking } from "@flamework/networking";

import { Size } from "shared/utility/numbers";
import Log from "shared/logger";

import { PacketHeader } from "./encodables/packet-header";
import { PacketFooter } from "./encodables/packet-footer";
import { Packet } from "./encodables/packet";
import { SizedString } from "./encodables/sized-string";
import { Number } from "./encodables/number";
import type { EncodableWrappedValue } from "./encodable";

namespace PaktMiddleware {
  export function events<I extends unknown[]>(): Networking.EventMiddleware<I> {
    return (processNext, event) =>
      (player, ...args) => processNext(player, ...<I><unknown>[createPacket<I>(args)]);
  }

  export function functions<I extends unknown[]>(): Networking.FunctionMiddleware<I> {
    return (processNext, func) =>
      (player, ...args) => processNext(player, ...<I><unknown>[createPacket<I>(args)]);
  }

  function createPacket<I extends unknown[]>(args: I): Buffer {
    const payload: EncodableWrappedValue[] = encodeArgs<I>(args);
    const header = new PacketHeader(payload.reduce((sum, encodable) => sum + encodable.size(), 0)); // 1 byte number, 2 byte number, 15 byte string
    const footer = new PacketFooter;
    const packet = new Packet(header, payload, footer);
    return packet.encode();
  }

  function encodeArgs<I extends unknown[]>(args: I): EncodableWrappedValue[] {
    const payload: EncodableWrappedValue[] = [];
    for (const arg of args) {
      let encodedArg: Maybe<EncodableWrappedValue>;
      switch (typeOf(arg)) {
        case "number": {
          encodedArg = new Number(<number>arg, Size.inBytes(<number>arg));
          break;
        }
        case "string": {
          encodedArg = new SizedString(<string>arg);
          break;
        }
        case "boolean": {
          // TODO: very soon!
          break;
        }

        default:
          throw new Log.Exception("PaktMiddleware.TypeNotSupported", `Encoding "${typeOf(arg)}" type is not yet supported`);
      }

      if (encodedArg !== undefined)
        payload.push(encodedArg);
    }

    return payload;
  }
}

export = PaktMiddleware;