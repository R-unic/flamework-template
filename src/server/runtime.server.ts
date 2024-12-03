import { Flamework } from "@flamework/core";

import { Replicator } from "shared/classes/replicable";
import { FlameworkIgnited } from "shared/constants";

try {
	Flamework.addPaths("src/server/hook-managers");
	Flamework.addPaths("src/server/components");
	Flamework.addPaths("src/server/services");
	Flamework.ignite();
	Replicator.initialize();

	FlameworkIgnited.Fire();
} catch (e) {
	error("Issue igniting Flamework: " + <string>e);
}