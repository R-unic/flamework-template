import { Service, Modding, type OnStart } from "@flamework/core";
import { BaseComponent } from "@flamework/components";

import { LogStart } from "shared/hooks";
import Log from "shared/logger";

@Service({ loadOrder: 0 })
export class LoggingService implements OnStart {
  public onStart(): void {
    Modding.onListenerAdded<LogStart>(object => object instanceof BaseComponent ? Log.server_component(object) : Log.service(object));
  }
}