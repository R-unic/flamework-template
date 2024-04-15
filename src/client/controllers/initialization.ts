import type { Components } from "@flamework/components";
import { Controller, type OnStart } from "@flamework/core";

import { Events } from "client/network";
import type { Movement } from "client/components/movement";
import { Character } from "shared/utility/client";

@Controller()
export class InitializationController implements OnStart {
  public constructor(
    private readonly components: Components
  ) { }

  public onStart(): void {
    Events.data.initialize();
    this.components.addComponent<Movement>(Character);
  }
}