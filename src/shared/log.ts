import { BaseComponent } from "@flamework/components";
import { RunService as Runtime, Players } from "@rbxts/services";
import { Logger, OutputStream } from "@rbxts/ez-log";
import { getName } from "@rbxts/flamework-meta-utils";

function getInstancePath(instance: Instance): string {
  let path = instance.GetFullName()
    .gsub("Workspace", "World")[0]
    .gsub("PlayerGui", "UI")[0];

  if (Runtime.IsClient())
    [path] = path.gsub(`Players.${Players.LocalPlayer.Name}.`, "");

  return path;
}

class FlameworkLogger extends Logger {
  /**
   * @param name Name of the component class
   * @param component The component itself
   */
  public async clientComponent(component: BaseComponent): Promise<void> {
    this.info(`Started ${getName(component)} on ${await getInstancePath(component.instance)}`, ["client_component"]);
  }

  /**
   * @param name Name of the component class
   * @param component The component itself
   */
  public async serverComponent(component: BaseComponent): Promise<void> {
    this.info(`Started ${getName(component)} on ${await getInstancePath(component.instance)}`, ["server_component"]);
  }

  /**
   * @param name Name of the controller
   */
  public controller(controller: object): void {
    this.info(`Started ${getName(controller)}`, ["controller"]);
  }

  /**
   * @param name Name of the service
   */
  public service(service: object): void {
    this.info(`Started ${getName(service)}`, ["service"]);
  }
}

const Log = new FlameworkLogger(OutputStream.RobloxConsole);
export = Log;