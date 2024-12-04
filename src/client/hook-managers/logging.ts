import { Controller, Modding, type OnStart } from "@flamework/core";
import { BaseComponent } from "@flamework/components";

import { LogStart } from "shared/hooks";
import Log from "shared/log";

@Controller()
export class LoggingController implements OnStart {
  public onStart(): void {
    Modding.onListenerAdded<LogStart>(object => object instanceof BaseComponent ? Log.clientComponent(object) : Log.controller(object));
  }
}