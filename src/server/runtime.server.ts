import { Flamework } from "@flamework/core";

import { FlameworkIgnitionException } from "shared/exceptions";
import * as Dependencies from "shared/dependencies";
// import { PacketHeader } from "./pakt/encodables/packet-header";
// import { PacketFooter } from "./pakt/encodables/packet-footer";
// import { Packet } from "./pakt/encodables/packet";
// import { BinaryReader } from "shared/classes/binary-reader";

try {
	Dependencies.registerAll();
	Flamework.addPaths("src/server/hook-managers");
	Flamework.addPaths("src/server/components");
	Flamework.addPaths("src/server/services");
	Flamework.ignite();
} catch (e) {
	throw new FlameworkIgnitionException(<string>e);
}

// const header = new PacketHeader(1);
// const payload = [69];
// const footer = new PacketFooter;
// const validatePayload = (payload: Buffer): boolean => payload.size() > 0;
// const packet = new Packet(header, payload, footer, validatePayload);
// const packetReader = new BinaryReader(packet.encode());
// const parsedPacket = Packet.parse(packetReader, validatePayload);

// print("original packet", packet)
// print("parsed packet", parsedPacket)