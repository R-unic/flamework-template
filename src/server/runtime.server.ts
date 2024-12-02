import { Flamework } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { PartPool } from "@rbxts/flamework-instance-pooling";

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

const pool = new PartPool(new Instance("Part"), World, 10);
const part = pool.take(new CFrame(0, 5, 0));
task.wait(6);
part.returnToPool();