import { Controller, type OnInit } from "@flamework/core";
import { TweenInfoBuilder } from "@rbxts/builders";

import { PlayerGui } from "client/utility";
import { tween } from "shared/utility/ui";
import type { LogStart } from "shared/hooks";
import Lazy from "shared/classes/lazy";

@Controller()
export class UIEffectsController implements OnInit, LogStart {
  private readonly screen = new Lazy<ScreenGui>(() => {
    const screen = new Instance("ScreenGui", PlayerGui);
    screen.Name = "UIEffects";
    screen.DisplayOrder = 10;
    screen.ScreenInsets = Enum.ScreenInsets.DeviceSafeInsets;
    return screen;
  });
  private readonly blackFrame = new Lazy<Frame>(() => {
    const frame = new Instance("Frame", this.screen.getValue());
    frame.Name = "Black";
    frame.Size = UDim2.fromScale(1, 1);
    frame.BackgroundColor3 = new Color3;
    frame.Transparency = 1;
    return frame;
  });

  public onInit(): void {
    this.screen.getValue();
    this.blackFrame.getValue();
  }

  public async blackFade<Disable extends boolean = false>(manualDisable: Disable = <Disable>false, timeBetween = 0.5, fadeTime = 0.65): Promise<Disable extends true ? () => Tween : void> {
    type RType = Disable extends true ? () => Tween : void;
    const info = new TweenInfoBuilder()
      .SetTime(fadeTime)
      .SetEasingStyle(Enum.EasingStyle.Sine);

    const toggle = (on: boolean) => tween(this.blackFrame.getValue(), info, { Transparency: on ? 0 : 1 });
    const fadeIn = toggle(true);
    fadeIn.Completed.Wait();
    fadeIn.Destroy();
    task.wait(timeBetween);

    if (!manualDisable)
      toggle(false);

    return new Promise(resolve =>
      resolve(<RType>(manualDisable === true ? () => toggle(false) : void 0))
    );
  }
}