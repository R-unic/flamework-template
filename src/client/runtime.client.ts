import { Flamework } from "@flamework/core";
import { FlameworkIgnitionException } from "shared/exceptions";

try {
	Flamework.addPaths("src/client/components");
	Flamework.addPaths("src/client/controllers");
	Flamework.ignite();
} catch (e) {
	throw new FlameworkIgnitionException(<string>e);
}
