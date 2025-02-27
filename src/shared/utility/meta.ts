import { Modding } from "@flamework/core";
import { t } from "@rbxts/t";

/** @hidden */
function _getInstanceAtPath([paths]: string[][]): Maybe<Instance> {
  let instance: Maybe<Instance> = game;

  for (const path of paths) {
    if (instance === undefined) break;
    instance = instance.FindFirstChild(path);
  }

  return instance;
}

/**
 * Resolves the instance at the given path using Rojo
 *
 * @metadata macro intrinsic-arg-shift
 */
export function getInstanceAtPath<T extends string>(path: T, meta?: Modding.Intrinsic<"path", [T]>): Maybe<Instance> {
  return _getInstanceAtPath(path as unknown as string[][]);
}

/**
 * Macro that generates a type guard (if one is not specified) then if the guard passes, returns the casted value
 *
 * @metadata macro
 */
export function safeCast<T>(value: unknown, guard?: t.check<T> | Modding.Generic<T, "guard">): Maybe<T> {
  return guard !== undefined ?
    (guard(value) ? value : undefined)
    : undefined;
}

/**
 * Generates a map and a decorator that adds the target to the map, for the given object type and constructor arguments
 */
export function createMappingDecorator<T extends object, CtorArgs extends unknown[] = never[], Args extends unknown[] = []>() {
  type ObjectConstructor = new (...args: CtorArgs) => T;

  const map = new Map<string, [ObjectConstructor, Args]>;
  const decorator = (...args: Args) => <K extends ObjectConstructor>(ctor: K) => void map.set(tostring(ctor), [ctor, args]);
  return [map, decorator] as const;
}