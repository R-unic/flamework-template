import { Flamework } from "@flamework/core";

import { FlameworkIgnited } from "shared/constants";

try {
	Flamework.addPaths("src/client/hook-managers");
	Flamework.addPaths("src/client/components");
	Flamework.addPaths("src/client/controllers");
	Flamework.ignite();

	FlameworkIgnited.Fire();
} catch (e) {
	error("Issue igniting Flamework: " + <string>e);
}