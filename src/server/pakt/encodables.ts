import { PacketHeader } from "./encodables/packet-header";
import { PacketFooter } from "./encodables/packet-footer";
import { Packet } from "./encodables/packet";
import { Number } from "./encodables/number";
import { SizedArray } from "./encodables/sized-array";
import { SizedString } from "./encodables/sized-string";
import type { Encodable } from "./encodable";

export type StaticEncodable = typeof Encodable;

export const Encodables = [
  PacketHeader,
  PacketFooter,
  Packet,
  Number,
  SizedString,
  SizedArray
].map<StaticEncodable>(t => <StaticEncodable>t);
