import { Modding } from "@flamework/core";

// This file is for dependencies that aren't singletons or components
// This type is to prevent type interning from TypeScript
type Marker = {
  _marker?: void;
};

/**
 * The name of the dependency `Name` was injected into
 */
export type Name = string & Marker;

export function registerAll(): void {
  Modding.registerDependency<Name>(ctor => tostring(ctor));
}