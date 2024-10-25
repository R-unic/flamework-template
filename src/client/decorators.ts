import { Modding } from "@flamework/core/out/modding";
import { Context } from "@rbxts/gamejoy";
import { Action, Axis, Union } from "@rbxts/gamejoy/out/Actions";
import { BaseAction } from "@rbxts/gamejoy/out/Class/BaseAction";
import type { ActionLike, ActionOptions, AxisActionEntry, RawActionEntry } from "@rbxts/gamejoy/out/Definitions/Types";

import Log from "shared/logger";

const inputContext = new Context();
const actions: Record<string, BaseAction> = {};

export const OnInput = Modding.createDecorator<[binding: RawActionEntry | RawActionEntry[], actionName?: string, options?: ActionOptions]>(
  "Method",
  (descriptor, [rawAction, actionName, options]) => {
    const action: BaseAction = typeOf(rawAction) === "string" ?
      new Action(<RawActionEntry>rawAction, options)
      : new Union(<RawActionEntry[]>rawAction);

    if (action instanceof Union && options !== undefined)
      Log.warning(`Action options given to @OnInput decorator on "${descriptor.property}" method were ignored because it is a union action`);

    if (actionName !== undefined)
      actions[actionName] = action;

    inputContext.Bind(<ActionLike<RawActionEntry>>action, () => {
      const object = <Record<string, Callback>><unknown>descriptor.object;
      object[descriptor.property](object, action);
    });
  }
);

export const OnAxisInput = Modding.createDecorator<[binding: AxisActionEntry, actionName?: string]>(
  "Method",
  (descriptor, [rawAction, actionName]) => {
    const axis = new Axis(rawAction);
    if (actionName !== undefined)
      actions[actionName] = axis;

    inputContext.Bind(axis, () => {
      const object = <Record<string, Callback>><unknown>descriptor.object;
      object[descriptor.property](object, axis);
    });
  }
);

/** **Note:** You need to provide an action name to the OnInput decorator to use this decorator, with which you will use the same action name. */
export const OnInputRelease = Modding.createDecorator<[actionName: string]>(
  "Method",
  (descriptor, [actionName]) => task.spawn(() => {
    let action = actions[actionName];
    if (action === undefined) {
      task.wait(0.1)
      action = actions[actionName]
    }

    if (action === undefined)
      throw Log.fatal(`Failed to bind method "${descriptor.property}" using @OnInputRelease decorator: No input action "${actionName}" exists`);

    inputContext.BindEvent(actionName, action.Released, () => {
      const object = <Record<string, Callback>><unknown>descriptor.object;
      object[descriptor.property](object, action);
    });
  })
);