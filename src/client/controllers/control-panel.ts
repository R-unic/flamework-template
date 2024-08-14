import type { Components } from "@flamework/components";
import { Controller, type OnStart } from "@flamework/core";
import { Stats } from "@rbxts/services";
import { Context as InputContext } from "@rbxts/gamejoy";
import type { Widget } from "@rbxts/iris/out/IrisDeclaration";
import type { WindowCreation } from "@rbxts/iris/out/widgetsTypes/Window";
import Object from "@rbxts/object-utils";
import Iris from "@rbxts/iris";

import { Player } from "shared/utility/client";
import { isDeveloper } from "shared/constants";
import { roundDecimal } from "shared/utility/numbers";

import type { Movement } from "client/components/movement";
import type { MouseController } from "./mouse";
import type { CameraController } from "./camera";

@Controller()
export class ControlPanelController implements OnStart {
  private readonly input = new InputContext({
    ActionGhosting: 0,
    Process: false,
    RunSynchronously: true
  });

  private highestNetworkSend = 0;
  private highestHeartbeatTime = 0;

  public constructor(
    private readonly components: Components,
    private readonly mouse: MouseController,
    private readonly camera: CameraController
  ) { }

  public async onStart(): Promise<void> {
    const windowSize = new Vector2(300, 400);
    let window: Widget<WindowCreation>;
    let mouseUnlocked = false;

    this.input
      .Bind("Comma", () => {
        if (!isDeveloper(Player)) return;
        window.state.isOpened.set(!window.state.isOpened.get());
      })
      .Bind("P", () => {
        if (!isDeveloper(Player)) return;
        mouseUnlocked = !mouseUnlocked;
        this.mouse.iconEnabled(mouseUnlocked);
        this.mouse.behavior(mouseUnlocked ? Enum.MouseBehavior.Default : Enum.MouseBehavior.LockCenter);
        Player.CameraMode = mouseUnlocked ? Enum.CameraMode.Classic : Enum.CameraMode.LockFirstPerson;
      });

    Iris.Init();
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.colorDark);
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.sizeClear);
    Iris.Connect(() => {
      window = Iris.Window(["Control Panel"], {
        size: Iris.State(windowSize),
        isOpened: Iris.State(false)
      });
      {
        this.renderStatsTab();
        this.renderCameraTab();

        const [movement] = this.components.getAllComponents<Movement>();
        movement?.renderControlPanelSettings();
      }
      Iris.End();
    });
  }

  private renderStatsTab(): void {
    Iris.Tree(["Statistics"]);
    {
      const receive = Stats.DataReceiveKbps;
      const send = Stats.DataSendKbps;
      const heartbeatTime = roundDecimal(Stats.HeartbeatTimeMs, 3);
      if (send > this.highestNetworkSend)
        this.highestNetworkSend = send;
      if (heartbeatTime > this.highestHeartbeatTime)
        this.highestHeartbeatTime = heartbeatTime;
      Iris.Text([`<b>Network Receive</b>: ${receive < 1 ? "&lt;1" : math.floor(receive)} kb/s`, undefined, undefined, true]);
      Iris.Text([`<b>Network Send</b>: ${send < 1 ? "&lt;1" : math.floor(send)} kb/s`, undefined, undefined, true]);
      Iris.Text([`<b>Highest Network Send</b>: ${this.highestNetworkSend < 1 ? "&lt;1" : math.floor(this.highestNetworkSend)} kb/s`, undefined, undefined, true]);
      Iris.Text([`<b>Heartbeat Time</b>: ${heartbeatTime} ms`, undefined, undefined, true]);
      Iris.Text([`<b>Highest Heartbeat Time</b>: ${this.highestHeartbeatTime} ms`, undefined, undefined, true]);
      Iris.Text([`<b>Memory Usage (Signals)</b>: ${math.floor(Stats.GetMemoryUsageMbForTag("Signals"))} mb`, undefined, undefined, true]);
      Iris.Text([`<b>Memory Usage (Script)</b>: ${math.floor(Stats.GetMemoryUsageMbForTag("Script"))} mb`, undefined, undefined, true]);
      Iris.Text([`<b>Memory Usage (Total)</b>: ${math.floor(Stats.GetTotalMemoryUsageMb())} mb`, undefined, undefined, true]);
    }
    Iris.End();
  }

  private renderCameraTab(): void {
    Iris.Tree(["Camera"]);

    const currentCamera = this.camera.get().instance;
    const fov = Iris.SliderNum(["FOV", 0.25, 1, 120], { number: Iris.State(currentCamera.FieldOfView) });
    if (fov.numberChanged())
      currentCamera.FieldOfView = fov.state.number.get();

    const cameraComponents = Object.keys(this.camera.cameras).sort();
    const componentIndex = Iris.State<keyof typeof this.camera.cameras>(this.camera.currentName);
    Iris.Combo(["Camera Component"], { index: componentIndex });
    for (const component of cameraComponents)
      Iris.Selectable([component, component], { index: componentIndex });
    Iris.End();

    if (this.camera.currentName !== componentIndex.get())
      this.camera.set(componentIndex.get());

    Iris.End();
  }
}