import { Controller, type OnStart } from "@flamework/core";
import { Workspace as World, Stats } from "@rbxts/services";
import type { Widget } from "@rbxts/iris/out/IrisDeclaration";
import type { WindowCreation } from "@rbxts/iris/out/widgetsTypes/Window";
import Object from "@rbxts/object-utils";
import Iris from "@rbxts/iris";

import { OnInput } from "client/decorators";
import { Player } from "client/utility";
import { isDeveloper } from "shared/constants";
import { roundDecimal } from "shared/utility/numbers";
import { getAverage } from "shared/utility/array";

import type { MouseController } from "./mouse";
import type { CameraController, Cameras } from "./camera";

const STAT_UPDATE_RATE = 1; // second

@Controller({ loadOrder: 1 })
export class ControlPanelController implements OnStart {
  private readonly sendSizes: number[] = [];
  private readonly recvSizes: number[] = [];
  private window!: Widget<WindowCreation>;
  private mouseUnlocked = false;
  private lastSendRecvUpdate = 0;
  private avgSend = 0;
  private avgRecv = 0;
  private highestSend = 0;
  private highestRecv = 0;
  private lowestSend = 0;
  private lowestRecv = 0;

  public constructor(
    private readonly mouse: MouseController,
    private readonly camera: CameraController
  ) { }

  public async onStart(): Promise<void> {
    const windowSize = new Vector2(300, 400);

    Iris.Init();
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.colorDark);
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.sizeClear);
    Iris.Connect(() => {
      this.window = Iris.Window(["Control Panel"], {
        size: Iris.State(windowSize),
        isOpened: Iris.State(false)
      });
      {
        this.renderStatsTab();
        this.renderCameraTab();
      }
      Iris.End();
    });
  }

  @OnInput("Comma")
  public open(): void {
    if (!isDeveloper(Player)) return;
    this.window.state.isOpened.set(!this.window.state.isOpened.get());
  }

  @OnInput("P")
  public unlockMouse(): void {
    if (!isDeveloper(Player)) return;
    this.mouseUnlocked = !this.mouseUnlocked;
    this.mouse.iconEnabled(this.mouseUnlocked);
    this.mouse.behavior(this.mouseUnlocked ? Enum.MouseBehavior.Default : Enum.MouseBehavior.LockCenter);
    Player.CameraMode = this.mouseUnlocked ? Enum.CameraMode.Classic : Enum.CameraMode.LockFirstPerson;
  }

  private renderStatsTab(): void {
    const now = os.clock();
    if (now - this.lastSendRecvUpdate >= STAT_UPDATE_RATE) {
      const sortedSends = this.sendSizes.sort();
      const sortedRecvs = this.recvSizes.sort();
      this.highestSend = sortedSends[sortedSends.size() - 1];
      this.lowestSend = sortedSends[0];
      this.highestRecv = sortedRecvs[sortedRecvs.size() - 1];
      this.lowestRecv = sortedRecvs[0];
      this.avgSend = getAverage(this.sendSizes);
      this.avgRecv = getAverage(this.recvSizes);

      this.sendSizes.clear();
      this.recvSizes.clear();
      this.lastSendRecvUpdate = now;
    }

    Iris.Tree(["Statistics"]);
    {
      const recv = Stats.DataReceiveKbps;
      const send = Stats.DataSendKbps;
      this.recvSizes.push(recv);
      this.sendSizes.push(send);

      const formatKBsPerSecond = (kbps: number) => (kbps === undefined ? "..." : (kbps < 0.1 ? "<0.1" : roundDecimal(kbps, 2))) + " kb/s";
      Iris.Text([`Network Receive: ${formatKBsPerSecond(recv)}`]);
      Iris.Text([`Network Receive (High): ${formatKBsPerSecond(this.highestRecv)}`]);
      Iris.Text([`Network Receive (Low): ${formatKBsPerSecond(this.lowestRecv)}`]);
      Iris.Text([`Network Receive (Average): ${formatKBsPerSecond(this.avgRecv)}`]);
      Iris.Text([`Network Send: ${formatKBsPerSecond(send)}`]);
      Iris.Text([`Network Send (High): ${formatKBsPerSecond(this.highestSend)}`]);
      Iris.Text([`Network Send (Low): ${formatKBsPerSecond(this.lowestSend)}`]);
      Iris.Text([`Network Send (Average): ${formatKBsPerSecond(this.avgSend)}`]);
      Iris.Text([`Heartbeat Time: ${roundDecimal(Stats.HeartbeatTimeMs, 2)} ms`]);
      Iris.Text([`Memory Usage (Signals): ${math.floor(Stats.GetMemoryUsageMbForTag("Signals"))} mb`]);
      Iris.Text([`Memory Usage (Script): ${math.floor(Stats.GetMemoryUsageMbForTag("Script"))} mb`]);
      Iris.Text([`Memory Usage (Total): ${math.floor(Stats.GetTotalMemoryUsageMb())} mb`]);
      Iris.Text([`Workspace Instance Count: ${World.GetDescendants().size()}`]);
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
    const componentIndex = Iris.State<keyof Cameras>(this.camera.currentName);
    Iris.Combo(["Camera Component"], { index: componentIndex });
    for (const component of cameraComponents)
      Iris.Selectable([component, component], { index: componentIndex });
    Iris.End();

    if (this.camera.currentName !== componentIndex.get())
      this.camera.set(componentIndex.get());

    Iris.End();
  }
}