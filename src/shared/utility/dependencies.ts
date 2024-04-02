import { Modding } from "@flamework/core";

/**
 * The name of the dependency `Name` was injected into
 */
export type Name = string & { _marker?: void };

Modding.registerDependency<Name>(ctor => tostring(ctor));