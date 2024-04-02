import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { slice } from "@rbxts/string-utils";

import { Functions } from "client/network";
import { PlayerGui } from "shared/utility/client";
import type { LogStart } from "shared/hooks";

const REFRESH_RATE = 180; // seconds (3 mins)

@Component({
  tag: "VersionLabel",
  ancestorWhitelist: [ PlayerGui ]
})
export class VersionLabel extends BaseComponent<{}, TextLabel> implements OnStart, LogStart {
  public onStart(): void {
    task.spawn(() => {
      do
        this.update()
      while (task.wait(REFRESH_RATE));
    });
  }

  private async update(): Promise<void> {
    const { tags: [tag], commits: [commit] } = await Functions.github.getInfo();
    this.instance.Text = `${tag.name} (${slice(commit.tree.sha, 0, 7)})`;
  }
}