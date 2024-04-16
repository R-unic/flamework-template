import { Flamework } from "@flamework/core";

import { FlameworkIgnitionException } from "shared/exceptions";
import * as Dependencies from "shared/dependencies";
import Pakt from "./pakt";

try {
	Dependencies.registerAll();
	Flamework.addPaths("src/server/hook-managers");
	Flamework.addPaths("src/server/components");
	Flamework.addPaths("src/server/services");
	Flamework.ignite();
} catch (e) {
	throw new FlameworkIgnitionException(<string>e);
}

// const header = new Pakt.PacketHeader(4); // 4-bit payload width
// const payload: Buffer = [69];
// const footer = new Pakt.PacketFooter();

// const validatePayload = (payload: Buffer): boolean => payload.size() === 1;
// const packet = new Pakt.Packet(header, payload, footer, validatePayload) // validate that payload is 1 byte wide
// print("original packet", packet);
// const serializedPacket = packet.serialize();
// print("serialized packet", serializedPacket);
// const parsedPacket = Pakt.Packet.parse(serializedPacket, validatePayload);
// print("parsed packet", parsedPacket);