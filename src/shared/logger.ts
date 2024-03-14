import { BaseComponent } from "@flamework/components";
import { getInstancePath } from "./utilities/helpers";
import { Reflect } from "@flamework/core";

type LogFunctionName = ExtractKeys<typeof Log, Callback>;

const DISABLED: Partial<Record<LogFunctionName, boolean>> = {

};

const log = (category: LogFunctionName, ...messages: unknown[]): void => {
  if (DISABLED[category]) return;
  print(`[${category.upper()}]:`, ...messages);
}

const getName = (obj: object) => (<string>Reflect.getMetadata(obj, "identifier")).split("@")[1];

namespace Log {
  export function info(...messages: unknown[]): void {
    log("info", ...messages);
  }

  export function warning(message: string): void {
    log("warning", message);
  }

  /**
   * @param name Name of the component class
   * @param component The component itself
   */
  export async function client_component(component: BaseComponent): Promise<void> {
    log("client_component", `Started ${getName(component)} on ${await getInstancePath(component.instance)}`);
  }

  /**
   * @param name Name of the component class
   * @param component The component itself
   */
  export async function server_component(component: BaseComponent): Promise<void> {
    log("server_component", `Started ${getName(component)} on ${await getInstancePath(component.instance)}`);
  }

  /**
   * @param name Name of the controller
   */
  export function controller(controller: object): void {
    log("controller", `Started ${getName(controller)}`);
  }

  /**
   * @param name Name of the service
   */
  export function service(service: object): void {
    log("service", `Started ${getName(service)}`);
  }
}

export default Log;