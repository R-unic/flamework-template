import { Flamework } from "@flamework/core";

import { FlameworkIgnited } from "shared/constants";

try {
	Flamework.addPaths("src/server/hook-managers");
	Flamework.addPaths("src/server/components");
	Flamework.addPaths("src/server/services");
	Flamework.ignite();
	FlameworkIgnited.Fire();
} catch (e) {
	error("Issue igniting Flamework: " + <string>e);
}