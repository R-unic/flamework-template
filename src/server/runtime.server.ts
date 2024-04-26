import { Flamework } from "@flamework/core";

import { FlameworkIgnitionException } from "shared/exceptions";
import * as Dependencies from "shared/dependencies";

try {
	Dependencies.registerAll();
	Flamework.addPaths("src/server/hook-managers");
	Flamework.addPaths("src/server/components");
	Flamework.addPaths("src/server/services");
	Flamework.ignite();
} catch (e) {
	throw new FlameworkIgnitionException(<string>e);
}