import { Modding } from "@flamework/core/out/modding";
import { Context } from "@rbxts/gamejoy";
import { Action, Axis, Union } from "@rbxts/gamejoy/out/Actions";
import { BaseAction } from "@rbxts/gamejoy/out/Class/BaseAction";
import type { Constructor } from "@flamework/core/out/utility";
import type { ActionLike, ActionOptions, AxisActionEntry, RawActionEntry } from "@rbxts/gamejoy/out/Definitions/Types";
import type { ClientReceiver as ClientEventReceiver } from "@flamework/networking/out/events/types";
import type { ClientReceiver as ClientFunctionReceiver } from "@flamework/networking/out/functions/types";
import type { Serializer } from "@rbxts/flamework-binary-serializer";

import { FlameworkIgnited } from "shared/constants";
import Log from "shared/logger";

const inputContext = new Context({ Process: false });
const processedContext = new Context({ Process: true });
export const inputActions: Record<string, BaseAction> = {};

export const OnInput = Modding.createDecorator<[binding: (RawActionEntry | BaseAction) | (RawActionEntry | BaseAction)[], actionName?: string, process?: boolean, options?: ActionOptions]>(
  "Method",
  (descriptor, [rawAction, actionName, process, options]) => {
    const action: BaseAction = typeOf(rawAction) === "string" ?
      new Action(<RawActionEntry>rawAction, options)
      : rawAction instanceof BaseAction ?
        rawAction
        : new Union(<RawActionEntry[]>rawAction);

    if (action instanceof Union && options !== undefined)
      Log.warning(`Action options given to @OnInput decorator on "${descriptor.property}" method were ignored because it is a union action`);

    if (actionName !== undefined)
      inputActions[actionName] = action;

    FlameworkIgnited.Once(() => {
      const context = process ? processedContext : inputContext;
      context.Bind(<ActionLike<RawActionEntry>>action, () => {
        const object = <Record<string, Callback>>Modding.resolveSingleton(descriptor.constructor!);
        void task.spawn(object[descriptor.property], object, action);
      });
    });
  }
);

export const OnAxisInput = Modding.createDecorator<[binding: AxisActionEntry, actionName?: string, process?: boolean]>(
  "Method",
  (descriptor, [rawAction, actionName, process]) => {
    const axis = new Axis(rawAction);
    if (actionName !== undefined)
      inputActions[actionName] = axis;

    FlameworkIgnited.Once(() => {
      const context = process ? processedContext : inputContext;
      context.Bind(axis, () => {
        const object = <Record<string, Callback>>Modding.resolveSingleton(descriptor.constructor!);
        void task.spawn(object[descriptor.property], object, axis);
      });
    });
  }
);

/** **Note:** You need to provide an action name to the OnInput decorator to use this decorator, with which you will use the same action name. */
export const OnInputRelease = Modding.createDecorator<[actionName: string, process?: boolean]>(
  "Method",
  (descriptor, [actionName, process]) => task.spawn(() => {
    FlameworkIgnited.Once(() => {
      let action = inputActions[actionName];
      if (action === undefined) {
        task.wait(0.1);
        action = inputActions[actionName];
      }

      if (action === undefined)
        throw Log.fatal(`Failed to bind method "${descriptor.property}" using @OnInputRelease decorator: No input action "${actionName}" exists`);

      const context = process ? processedContext : inputContext;
      context.BindEvent(actionName, action.Released, () => {
        const object = <Record<string, Callback>>Modding.resolveSingleton(descriptor.constructor!);
        void task.spawn(object[descriptor.property], object, action);
      });
    });
  })
);

type ClientReceiver<I extends unknown[] = unknown[], O = void> = ClientEventReceiver<I> | ClientFunctionReceiver<I, O>;
interface MethodDescriptor<T extends Callback = Callback> {
  readonly value: T;
}

/** @metadata reflect identifier flamework:parameters */
export function LinkRemote<I extends unknown[] = unknown[], O = void>(remote: ClientReceiver<I, O>) {
  return (ctor: object, propertyKey: string, descriptor: MethodDescriptor<(self: unknown, ...input: I) => O>) => {
    (<UnionToIntersection<ClientReceiver<I, O>>>remote)["setCallback" in remote ? "setCallback" : "connect"]((...args) => descriptor.value(Modding.resolveSingleton(<Constructor>ctor), ...args));
  }
}

/** @metadata reflect identifier flamework:parameters */
export function LinkSerializedRemote<PacketStruct extends object, I extends [packet: SerializedPacket] = [packet: SerializedPacket], O = void>(remote: ClientReceiver<I, O>, deserializer: Serializer<PacketStruct>) {
  return (ctor: object, propertyKey: string, descriptor: MethodDescriptor<(self: unknown, struct: PacketStruct, ...otherArgs: never[]) => O>) => {
    (<UnionToIntersection<ClientReceiver<I, O>>>remote)["setCallback" in remote ? "setCallback" : "connect"]((...args) => {
      const [{ buffer, blobs }] = args;
      args.shift();

      const struct = deserializer.deserialize(buffer, blobs);
      return descriptor.value(Modding.resolveSingleton(<Constructor>ctor), struct, ...<never[]><unknown>args);
    });
  }
}