import { Flamework } from "@flamework/core";

import * as Dependencies from "shared/dependencies";

try {
	Dependencies.registerAll();
	Flamework.addPaths("src/client/hook-managers");
	Flamework.addPaths("src/client/components");
	Flamework.addPaths("src/client/controllers");
	Flamework.ignite();
} catch (e) {
	error("Issue igniting Flamework: " + <string>e);
}
