import { Flamework } from "@flamework/core";

import { FlameworkIgnited } from "shared/constants";
import { getInstanceAtPath } from "shared/utility/meta";

try {
  Flamework.addPaths("src/client/hook-managers");
  Flamework.addPaths("src/client/components");
  Flamework.addPaths("src/client/controllers");
  Flamework.ignite();

  FlameworkIgnited.Fire();
} catch (e) {
  error("Issue igniting Flamework: " + <string>e);
}