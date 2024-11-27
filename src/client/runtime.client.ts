import { Flamework } from "@flamework/core";
import Destroyable from "shared/classes/destroyable";
import { CumulativeID } from "shared/classes/id";

import { FlameworkIgnited } from "shared/constants";
import { Multiple } from "shared/utility/meta";

try {
	Flamework.addPaths("src/client/hook-managers");
	Flamework.addPaths("src/client/components");
	Flamework.addPaths("src/client/controllers");
	Flamework.ignite();
	FlameworkIgnited.Fire();
} catch (e) {
	error("Issue igniting Flamework: " + <string>e);
}

class Test extends Multiple(Destroyable, CumulativeID) {
	public constructor() {
		super();
		this.janitor.Add(() => print("destroyed"))
	}
}

class Test2 extends Test { }

const test = new Test();
test.destroy()
print(test.id)
print(test instanceof Destroyable)
print(test instanceof CumulativeID)
print(test instanceof Test)

const test2 = new Test2();
print(test2 instanceof Test2)
print(test2 instanceof Test)