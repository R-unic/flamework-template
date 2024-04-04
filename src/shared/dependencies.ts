import { Modding } from "@flamework/core";
import { $package, type PackageJson } from "rbxts-transform-package-json";

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
 * The version of the game taken from package.json
 */
export type Package = PackageJson & Marker;

export function registerAll(): void {
  Modding.registerDependency<Name>(ctor => tostring(ctor));
  Modding.registerDependency<Package>($package);
}