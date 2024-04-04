import { Modding } from "@flamework/core";
import { $package } from "rbxts-transform-package-json"

/**
 * The name of the dependency `Name` was injected into
 */
export type Name = string & { _marker?: void };
/**
 * The version of the game taken from package.json
 */
export type Version = string & { _marker?: void };

export function registerAll(): void {
  Modding.registerDependency<Name>(ctor => tostring(ctor));
  Modding.registerDependency<Version>(() => $package().version);
}