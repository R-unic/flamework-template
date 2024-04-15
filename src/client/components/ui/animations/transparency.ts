import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";

import { tween } from "shared/utility/ui";
import ButtonTweenAnimation from "client/base-components/button-tween-animation";

interface Attributes {
  TransparencyGoal: number;
  Speed: number;
}

const { EasingStyle } = Enum;

@Component({
  tag: "TransparencyAnimation",
  defaults: {
    TransparencyGoal: 0.5,
    Speed: 0.35
  }
})
export class TransparencyAnimation extends ButtonTweenAnimation<Attributes> implements OnStart {
  private readonly defaultTransparency = this.instance.Transparency;
  protected override readonly includeClick = false;

  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(EasingStyle.Quad)
    .SetTime(this.attributes.Speed);

  public onStart(): void {
    super.onStart();
  }

  public active(): void {
    tween(this.instance, this.tweenInfo, {
      BackgroundTransparency: this.attributes.TransparencyGoal
    });
  }

  public inactive(): void {
    tween(this.instance, this.tweenInfo, {
      BackgroundTransparency: this.defaultTransparency
    });
  }
}