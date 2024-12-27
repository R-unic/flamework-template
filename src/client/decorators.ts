import { Modding } from "@flamework/core";
import { InputManager, StandardAction, AxisAction } from "@rbxts/mechanism";
import { callMethodOnDependency } from "@rbxts/flamework-meta-utils";
import type { ClientReceiver as ClientEventReceiver } from "@flamework/networking/out/events/types";
import type { ClientReceiver as ClientFunctionReceiver } from "@flamework/networking/out/functions/types";
import type { Serializer } from "@rbxts/flamework-binary-serializer";

import { FlameworkIgnited } from "shared/constants";
import Log from "shared/log";

export const inputManager = new InputManager;

export const OnInput = Modding.createDecorator<[binding: StandardAction]>(
  "Method",
  (descriptor, [action]) => {
    FlameworkIgnited.Once(() => {
      inputManager.bind(action);
      action.activated.Connect(() => {
        const object = <Record<string, Callback>>Modding.resolveSingleton(descriptor.constructor!);
        void task.spawn(object[descriptor.property], object, action);
      });
    });
  }
);

export const OnAxisInput = Modding.createDecorator<[binding: AxisAction]>(
  "Method",
  (descriptor, [axis]) => {
    FlameworkIgnited.Once(() => {
      inputManager.bind(axis);
      axis.updated.Connect(() => {
        const object = <Record<string, Callback>>Modding.resolveSingleton(descriptor.constructor!);
        void task.spawn(object[descriptor.property], object, axis);
      });
    });
  }
);

/** **Note:** You need to provide an action name to the OnInput decorator to use this decorator, with which you will use the same action name. */
export const OnInputRelease = Modding.createDecorator<[actionID: string | number]>(
  "Method",
  (descriptor, [actionID]) => task.spawn(() => {
    FlameworkIgnited.Once(() => {
      let action = inputManager.getActionByID(actionID, StandardAction);
      if (action === undefined) {
        task.wait(0.1);
        action = inputManager.getActionByID(actionID, StandardAction);
      }

      if (action === undefined)
        throw Log.fatal(`Failed to bind method "${descriptor.property}" using @OnInputRelease decorator: No input action with ID "${actionID}" exists`);

      action.deactivated.Connect(() => {
        const object = <Record<string, Callback>>Modding.resolveSingleton(descriptor.constructor!);
        void task.spawn(object[descriptor.property], object, action);
      });
    });
  })
);

type ClientReceiver<I extends unknown[] = unknown[], O = void> = ClientEventReceiver<I> | ClientFunctionReceiver<I, O>;

/** @metadata reflect identifier flamework:parameters */
export function LinkRemote<I extends unknown[] = unknown[], O = void>(remote: ClientReceiver<I, O>) {
  return (ctor: object, propertyKey: string, descriptor: TypedPropertyDescriptor<(this: unknown, ...input: I) => O>) => {
    FlameworkIgnited.Once(() => {
      (<UnionToIntersection<ClientReceiver<I, O>>>remote)["setCallback" in remote ? "setCallback" : "connect"]((...args) => callMethodOnDependency(ctor, descriptor, ...args));
    });
  }
}

/** @metadata reflect identifier flamework:parameters */
export function LinkSerializedRemote<PacketStruct extends object, I extends [packet: SerializedPacket] = [packet: SerializedPacket], O = void>(remote: ClientReceiver<I, O>, deserializer: Serializer<PacketStruct>) {
  return (ctor: object, propertyKey: string, descriptor: TypedPropertyDescriptor<(this: unknown, struct: PacketStruct, ...otherArgs: never[]) => O>) => {
    FlameworkIgnited.Once(() => {
      (<UnionToIntersection<ClientReceiver<I, O>>>remote)["setCallback" in remote ? "setCallback" : "connect"]((...args) => {
        const [{ buffer, blobs }] = args;
        args.shift();

        const struct = deserializer.deserialize(buffer, blobs);
        return callMethodOnDependency(ctor, descriptor, struct, ...<never[]><unknown>args);
      });
    });
  }
}