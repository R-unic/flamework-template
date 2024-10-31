import { Reflect } from "@flamework/core";

export function createSymbol(name: string): symbol {
  const symbol = newproxy(true);
  const mt = <Record<string, unknown>>getmetatable(<never>symbol);
  mt.__tostring = () => name;
  return symbol;
}

/**
 * Generates a [mapping] decorator, and map, for the given object type and constructor arguments
 */
export function createMappingDecorator<T extends object, Args extends any[]>() {
  type ObjectConstructor = new (...args: Args) => T;

  const map = new Map<string, ObjectConstructor>();
  const decorator = <K extends ObjectConstructor>(ctor: K) => void map.set(tostring(ctor), ctor);
  return <const>[map, decorator];
}

export const getName = (obj: object) => (<string>Reflect.getMetadatas(obj, "identifier")[0]).split("@")[1];