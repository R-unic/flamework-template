import { Dependency, Modding, Reflect } from "@flamework/core";
import { getIdFromSpecifier } from "@flamework/components/out/utility";
import type { Constructor } from "@flamework/core/out/utility";
import type { Components } from "@flamework/components";

function assign<T>(target: T, source: object, ...args: unknown[]): T {
  for (const [key, value] of pairs(<Record<string, defined>>source))
    (<Record<string, defined>>target)[key] = value;

  if ("constructor" in source)
    (<Callback>source.constructor)(target, ...args);

  return target;
}

/**
 * Combines multiple classes into one to emulate multiple inheritance, use with caution
 *
 * Note: `instanceof` may not work as expected when using this function
 * */
export function Multiple<BaseClasses extends Constructor[]>(
  ...baseClasses: BaseClasses
): Constructor<UnionToIntersection<InstanceType<BaseClasses[number]>>> {
  return baseClasses.reduce(
    (Combined, Current) => class extends Combined {
      public constructor(...args: never[]) {
        super(...args);
        assign(this, new Current(...args));
        assign(this, Current);
      }
    },
    class {
      public constructor(..._: never[]) { }
    }
  ) as Constructor<UnionToIntersection<InstanceType<BaseClasses[number]>>>;
}

/** Resolves all dependencies behind the `ctor` constructor */
export function resolveDependency<T extends object = object>(ctor: Constructor<T>): T | T[] {
  try {
    return <T>Modding.resolveSingleton<T>(ctor);
  } catch (e) {
    const components = Dependency<Components>().getAllComponents(getIdFromSpecifier(<Constructor>ctor));
    return <T[]>components;
  }
}

/** Calls `process` for every dependency resolved from `ctor` */
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

/** Calls the descriptor method for every dependency resolved from `ctor` */
export function callMethodOnDependency<Args extends unknown[], O = void>(ctor: object, descriptor: MethodDescriptor<(self: unknown, ...args: Args) => O>, ...args: Args): O {
  return processDependency(<Constructor>ctor, dependency => descriptor.value(dependency, ...args))
}

declare const newproxy: <T extends symbol = symbol>(addMetatable: boolean) => T;

/** Create a unique symbol */
export function createSymbol<T extends symbol = symbol>(name: string): T {
  const symbol = newproxy<T>(true);
  const mt = <Record<string, unknown>>getmetatable(<never>symbol);
  mt.__tostring = () => name;
  return symbol;
}

/**
 * Generates a map and a decorator that adds the target to the map, for the given object type and constructor arguments
 */
export function createMappingDecorator<T extends object, Args extends unknown[]>() {
  type ObjectConstructor = new (...args: Args) => T;

  const map = new Map<string, [ObjectConstructor, Args]>;
  const decorator = (...args: Args) => <K extends ObjectConstructor>(ctor: K) => void map.set(tostring(ctor), [ctor, args]);
  return <const>[map, decorator];
}

export const getName = (obj: object) => (<string>Reflect.getMetadatas(obj, "identifier")[0]).split("@")[1];