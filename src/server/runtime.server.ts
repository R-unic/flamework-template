import { Flamework } from "@flamework/core";

import * as Dependencies from "shared/dependencies";

try {
	Dependencies.registerAll();
	Flamework.addPaths("src/server/hook-managers");
	Flamework.addPaths("src/server/components");
	Flamework.addPaths("src/server/services");
	Flamework.ignite();
} catch (e) {
	error("Issue igniting Flamework: " + <string>e);
}