import { Controller, type OnStart } from "@flamework/core";
import { Events } from "client/network";
import Log from "shared/logger";

@Controller()
export class InitializationController implements OnStart {
  public onStart(): void {
    Events.data.initialize();
  }
}