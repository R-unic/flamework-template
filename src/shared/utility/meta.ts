import { Dependency, Flamework, Modding, Reflect } from "@flamework/core";
import { getIdFromSpecifier } from "@flamework/components/out/utility";
import type { Constructor } from "@flamework/core/out/utility";
import type { BaseComponent, Components } from "@flamework/components";

declare const newproxy: <T extends symbol = symbol>(addMetatable: boolean) => T;

interface MethodDescriptor<T extends Callback = Callback> {
  readonly value: T;
}

export function resolveDependency<T extends object = object>(ctor: Constructor<T>): T | T[] {
  try {
    return <T>Modding.resolveSingleton<T>(ctor);
  } catch (e) {
    const components = Dependency<Components>().getAllComponents(getIdFromSpecifier(<Constructor>ctor));
    return <T[]>components;
  }
}

export function processDependency<T extends object = object, O = void>(ctor: Constructor<T>, process: (dependency: T) => O): O {
  const dependencies = resolveDependency<T>(ctor);
  const isArray = (<T[]>dependencies).size() > 0;
  if (isArray) {
    let lastResult: O;
    for (const component of <T[]>dependencies)
      lastResult = process(component);

    return lastResult!;
  }

  return process(<T>dependencies);
}

export function callMethodOnDependency<Args extends unknown[], O = void>(ctor: object, descriptor: MethodDescriptor<(self: unknown, ...args: Args) => O>, ...args: Args): O {
  return processDependency(<Constructor>ctor, dependency => descriptor.value(dependency, ...args))
}

export function createSymbol<T extends symbol = symbol>(name: string): T {
  const symbol = newproxy<T>(true);
  const mt = <Record<string, unknown>>getmetatable(<never>symbol);
  mt.__tostring = () => name;
  return symbol;
}

/**
 * Generates a [mapping] decorator, and map, for the given object type and constructor arguments
 */
export function createMappingDecorator<T extends object, Args extends unknown[]>() {
  type ObjectConstructor = new (...args: Args) => T;

  const map = new Map<string, [ObjectConstructor, Args]>();
  const decorator = (...args: Args) => <K extends ObjectConstructor>(ctor: K) => void map.set(tostring(ctor), [ctor, args]);
  return <const>[map, decorator];
}

export const getName = (obj: object) => (<string>Reflect.getMetadatas(obj, "identifier")[0]).split("@")[1];