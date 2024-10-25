import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { $git } from "rbxts-transform-debug";

import type { LogStart } from "shared/hooks";
import { PlayerGui } from "shared/utility/client";

@Component({
  tag: "VersionLabel",
  ancestorWhitelist: [PlayerGui]
})
export class VersionLabel extends BaseComponent<{}, TextLabel> implements OnStart, LogStart {
  public onStart(): void {
    const gitInfo = $git();
    this.instance.Text = `${gitInfo.LatestTag} (${gitInfo.Commit})`;
  }
}