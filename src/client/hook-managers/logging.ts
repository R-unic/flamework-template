import { Controller, Modding, type OnStart } from "@flamework/core";
import { BaseComponent } from "@flamework/components";

import { LogStart } from "shared/hooks";
import Log from "shared/logger";

@Controller()
export class LoggingController implements OnStart {
  public onStart(): void {
    Modding.onListenerAdded<LogStart>(object => object instanceof BaseComponent ? Log.client_component(object) : Log.controller(object));
  }
}