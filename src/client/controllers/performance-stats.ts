import { Controller } from "@flamework/core";
import { Workspace as World, Stats } from "@rbxts/services";
import { eMath } from "@rbxts/atlas";
import Iris from "@rbxts/iris";

import { roundDecimal } from "shared/utility/numbers";
import type { ControlPanelDropdownRenderer } from "shared/structs/control-panel";

import { ControlPanelRenderable } from "./control-panel";

const STAT_UPDATE_RATE = 1; // second

@Controller()
@ControlPanelRenderable("Performance Statistics", 0)
export class PerformanceStatsController implements ControlPanelDropdownRenderer {
  private readonly sendSizes: number[] = [];
  private readonly recvSizes: number[] = [];
  private lastSendRecvUpdate = 0;
  private avgSend = 0;
  private avgRecv = 0;
  private highestSend = 0;
  private highestRecv = 0;
  private lowestSend = 0;
  private lowestRecv = 0;

  public renderControlPanelDropdown(): void {
    const now = os.clock();
    if (now - this.lastSendRecvUpdate >= STAT_UPDATE_RATE) {
      this.sendSizes.sort();
      this.recvSizes.sort();
      this.highestSend = this.sendSizes[this.sendSizes.size() - 1];
      this.lowestSend = this.sendSizes[0];
      this.highestRecv = this.recvSizes[this.recvSizes.size() - 1];
      this.lowestRecv = this.recvSizes[0];
      this.avgSend = eMath.avg(...this.sendSizes);
      this.avgRecv = eMath.avg(...this.recvSizes);

      this.sendSizes.clear();
      this.recvSizes.clear();
      this.lastSendRecvUpdate = now;
    }

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
}