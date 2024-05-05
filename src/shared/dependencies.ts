import { Modding, Reflect } from "@flamework/core";

// This file is for dependencies that aren't singletons or components
// This type is to prevent type interning from TypeScript
type Marker = {
  _marker?: void;
};

/**
 * The name of the dependency `Name` was injected into
 */
export type Name = string & Marker;

/**
 * Request the required metadata for lifecycle events and dependency resolution.
 * @metadata flamework:implements flamework:parameters injectable
 */
export const Singleton = Modding.createDecorator("Class", descriptor => {
  Reflect.defineMetadata(descriptor.object, "flamework:singleton", true);
});

export function registerAll(): void {
  Modding.registerDependency<Name>(ctor => tostring(ctor));
}