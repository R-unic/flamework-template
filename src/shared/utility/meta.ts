export function createMappingDecorator<T extends object, Args extends any[]>() {
  type ObjectConstructor = new (...args: Args) => T;

  const map = new Map<string, ObjectConstructor>();
  const decorator = <K extends ObjectConstructor>(ctor: K) => void map.set(tostring(ctor), ctor);
  return <const>[map, decorator];
}