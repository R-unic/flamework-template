import { ClientReceiver as ClientEventReceiver, ServerReceiver as ServerEventReceiver } from "@flamework/networking/out/events/types";
import { ClientReceiver as ClientFunctionReceiver, ServerReceiver as ServerFunctionReceiver } from "@flamework/networking/out/functions/types";

import { BinaryReader } from "shared/classes/binary-reader";
import { BaseEncodables, Packet } from "./encodables/packet";

namespace Pakt {
  export function receiveServerEvent<Args extends unknown[]>(receiver: ServerEventReceiver<Args>, callback: (player: Player, packet: Packet) => void): void {
    receiver.connect((player, ...args) => callback(player, parsePacket<Args>(args)));
  }

  export function receiveClientEvent<Args extends unknown[]>(receiver: ClientEventReceiver<Args>, callback: (packet: Packet) => void): void {
    receiver.connect((...args) => callback(parsePacket<Args>(args)));
  }

  export function receiveServerFunction<Args extends unknown[], R extends unknown>(receiver: ServerFunctionReceiver<Args, R>, callback: (player: Player, packet: Packet) => R): void {
    receiver.setCallback((player, ...args) => callback(player, parsePacket<Args>(args)));
  }

  export function receiveClientFunction<Args extends unknown[], R extends unknown>(receiver: ClientFunctionReceiver<Args, R>, callback: (packet: Packet) => R): void {
    receiver.setCallback((...args) => callback(parsePacket<Args>(args)));
  }

  function parsePacket<Args extends unknown[]>(args: Args): Packet {
    const [packetBuffer] = <Buffer[]>args;
    const packetReader = new BinaryReader(packetBuffer);
    const parsedPacket = Packet.parse(packetReader, BaseEncodables);
    parsedPacket.validate(parsedPacket.payload);

    return parsedPacket;
  }
}

export = Pakt;