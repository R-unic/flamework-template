import { Flamework } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";

import { Assets, FlameworkIgnited } from "shared/constants";

try {
	Flamework.addPaths("src/client/hook-managers");
	Flamework.addPaths("src/client/components");
	Flamework.addPaths("src/client/controllers");
	Flamework.ignite();

	FlameworkIgnited.Fire();
} catch (e) {
	error("Issue igniting Flamework: " + <string>e);
}

const block = Assets.GrassBlock.Clone();
block.Parent = World;
block.Position = new Vector3(0, 4, 0);