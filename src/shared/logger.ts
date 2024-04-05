import { BaseComponent } from "@flamework/components";
import { Reflect } from "@flamework/core";
import { $print, $error, $dbg } from "rbxts-transform-debug"

import { flatten, getInstancePath } from "./utility/helpers";
import repr from "./utility/repr";

type LogFunctionName = ExtractKeys<typeof Log, Callback>;

const DISABLED: Partial<Record<LogFunctionName, boolean>> = {

};

const log = (category: LogFunctionName, ...messages: defined[]): void => {
  if (DISABLED[category]) return;

  const prefix = `[${category.upper()}]:`;
  if (category === "fatal")
    $error(`${prefix} ${flatten(messages).map(v => typeOf(v) === "table" ? repr(v) : v).join(" ")}`, 4);
  else
    $print(prefix, ...messages);
}

const getName = (obj: object) => (<string>Reflect.getMetadata(obj, "identifier")).split("@")[1];

namespace Log {
  export class Exception {
    public constructor(
      name: string,
      public readonly message: string,
      public readonly level?: number
    ) {
      Log.fatal(`${name}Exception: ${message}`);
    }
  }

  export function info(...messages: defined[]): void {
    log("info", ...messages);
  }

  export function warning(...messages: defined[]): void {
    log("warning", messages);
  }

  export function fatal(...messages: defined[]): void {
    log("fatal", messages);
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