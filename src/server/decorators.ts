import { Modding } from "@flamework/core";
import type { Constructor } from "@flamework/core/out/utility";
import type { Serializer } from "@rbxts/flamework-binary-serializer";
import type { ServerReceiver as ServerEventReceiver } from "@flamework/networking/out/events/types";
import type { ServerReceiver as ServerFunctionReceiver } from "@flamework/networking/out/functions/types";

type ServerReceiver<I extends unknown[] = unknown[], O = void> = ServerEventReceiver<I> | ServerFunctionReceiver<I, O>;
interface MethodDescriptor<T extends Callback = Callback> {
  readonly value: T;
}

/** @metadata reflect identifier flamework:parameters */
export function LinkRemote<I extends unknown[] = unknown[], O = void>(remote: ServerReceiver<I, O>) {
  return (ctor: object, propertyKey: string, descriptor: MethodDescriptor<(self: unknown, player: Player, ...input: I) => O>) => {
    print(ctor, propertyKey, descriptor);
    (<UnionToIntersection<ServerReceiver<I, O>>>remote)["setCallback" in remote ? "setCallback" : "connect"]((...args) => descriptor.value(Modding.resolveSingleton(<Constructor>ctor), ...args));
  }
}

/** @metadata reflect identifier flamework:parameters */
export function LinkSerializedRemote<PacketStruct extends object, I extends [packet: SerializedPacket] = [packet: SerializedPacket], O = void>(remote: ServerReceiver<I, O>, deserializer: Serializer<PacketStruct>) {
  return (ctor: object, propertyKey: string, descriptor: MethodDescriptor<(self: unknown, player: Player, struct: PacketStruct, ...otherArgs: never[]) => O>) => {
    (<UnionToIntersection<ServerReceiver<I, O>>>remote)["setCallback" in remote ? "setCallback" : "connect"]((...args) => {
      const [player, { buffer, blobs }] = args;
      args.shift();
      args.shift();

      const struct = deserializer.deserialize(buffer, blobs);
      return descriptor.value(Modding.resolveSingleton(<Constructor>ctor), player, struct, ...<never[]><unknown>args);
    });
  }
}