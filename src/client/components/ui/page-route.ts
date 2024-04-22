import type { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";

import { PlayerGui } from "shared/utility/client";

import DestroyableComponent from "shared/base-components/destroyable";

interface Attributes {
  PageRoute_Destination: string;
  PageRoute_Exclusive: boolean; // whether or not all other pages should be disabled when destination page is reached
}

@Component({
  tag: "PageRoute",
  ancestorWhitelist: [PlayerGui],
  defaults: {
    PageRoute_Exclusive: true
  }
})
export class PageRoute extends DestroyableComponent<Attributes, GuiButton> implements OnStart {
  public onStart(): void {
    this.janitor.Add(this.instance.MouseButton1Click.Connect(() => {
      const screen = this.instance.FindFirstAncestorOfClass("ScreenGui")!;
      const frames = screen.GetChildren().filter((i): i is Frame => i.IsA("Frame"));
      const destination = <Frame>screen.WaitForChild(this.attributes.PageRoute_Destination);
      if (this.attributes.PageRoute_Exclusive)
        for (const frame of frames) {
          if (frame === destination) continue;
          frame.Visible = false;
        }

      destination.Visible = true;
    }));
  }
}