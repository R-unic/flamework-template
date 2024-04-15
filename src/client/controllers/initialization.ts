import { Controller, type OnStart } from "@flamework/core";

import { Events } from "client/network";
import { Movement } from "client/components/movement";

@Controller()
export class InitializationController implements OnStart {
  public onStart(): void {
    Events.data.initialize();
    Movement.start(); // remove if you don't want custom movement
  }
}