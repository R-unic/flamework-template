import { Modding } from "@flamework/core";
import { t } from "@rbxts/t";

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
  return <const>[map, decorator];
}