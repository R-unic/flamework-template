import { Flamework } from "@flamework/core";

import { FlameworkIgnitionException } from "shared/exceptions";
import { BinaryReader } from "shared/classes/binary-reader";
import * as Dependencies from "shared/dependencies";

import { BaseEncodables, Packet } from "./pakt/encodables/packet";
import { PacketHeader } from "./pakt/encodables/packet-header";
import { PacketFooter } from "./pakt/encodables/packet-footer";
import { Number } from "./pakt/encodables/number";
import { SizedString } from "./pakt/encodables/sized-string";

try {
	Dependencies.registerAll();
	Flamework.addPaths("src/server/hook-managers");
	Flamework.addPaths("src/server/components");
	Flamework.addPaths("src/server/services");
	Flamework.ignite();
} catch (e) {
	throw new FlameworkIgnitionException(<string>e);
}

const payload = [
	new Number(69, 1),
	new Number(420, 2),
	new SizedString("nutz 100")
];

const header = new PacketHeader(payload.reduce((sum, encodable) => sum + encodable.sizeInBytes, 0)); // 1 byte number, 2 byte number, 15 byte string
const footer = new PacketFooter;
const packet = new Packet(header, payload, footer);
const packetReader = new BinaryReader(packet.encode());
const parsedPacket = Packet.parse(packetReader, BaseEncodables);

print("original packet", packet)
print("parsed packet", parsedPacket)