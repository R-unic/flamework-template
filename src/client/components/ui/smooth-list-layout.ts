import type { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { getChildrenOfType, tween } from "@rbxts/instance-utility";
import { endsWith } from "@rbxts/string-utils";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "client/utility";

import DestroyableComponent from "shared/base-components/destroyable";

interface Attributes {
  readonly SmoothListLayout_Speed: number;
}

@Component({
  tag: $nameof<SmoothListLayout>(),
  ancestorWhitelist: [PlayerGui],
  defaults: {
    SmoothListLayout_Speed: 0.2
  }
})
export class SmoothListLayout extends DestroyableComponent<Attributes, GuiObject & { UIListLayout: UIListLayout; }> implements OnStart {
  private readonly tweenInfo = new TweenInfoBuilder()
    .SetTime(this.attributes.SmoothListLayout_Speed)
    .Build();

  public onStart(): void {
    for (const child of getChildrenOfType(this.instance, "GuiObject"))
      this.janitor.Add(child.Destroying.Once(() => this.createTransition(child)));

    this.janitor.Add(this.instance.ChildAdded.Connect(child => {
      if (!child.IsA("GuiObject")) return;
      if (endsWith(child.Name, "_TransitionFrame")) return;
      this.janitor.Add(child.Destroying.Once(() => this.createTransition(child)));
    }));
  }

  private createTransition(child: GuiObject): void {
    const transitionFrame = new Instance("Frame");
    transitionFrame.Name = child.Name + "_TransitionFrame"; // preserve name sorting
    transitionFrame.BackgroundTransparency = 1;
    transitionFrame.Size = child.Size;
    transitionFrame.LayoutOrder = child.LayoutOrder;
    transitionFrame.Parent = this.instance;

    const goalSize = this.instance.UIListLayout.FillDirection === Enum.FillDirection.Vertical ?
      new UDim2(child.Size.X.Scale, child.Size.X.Offset, 0, 0)
      : new UDim2(0, 0, child.Size.Y.Scale, child.Size.Y.Offset);

    tween(transitionFrame, this.tweenInfo, { Size: goalSize })
      .Completed.Once(() => transitionFrame.Destroy());
  }
}