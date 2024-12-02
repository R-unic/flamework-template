import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { $nameof } from "rbxts-transform-debug";

import { tween } from "shared/utility/instances";
import ButtonTweenAnimation from "client/base-components/button-tween-animation";

interface Attributes {
  readonly TransparencyAnimation_TransparencyGoal: number;
  readonly TransparencyAnimation_Speed: number;
}

@Component({
  tag: $nameof<TransparencyAnimation>(),
  defaults: {
    TransparencyAnimation_TransparencyGoal: 0.5,
    TransparencyAnimation_Speed: 0.35
  }
})
export class TransparencyAnimation extends ButtonTweenAnimation<Attributes> implements OnStart {
  private readonly defaultTransparency = this.instance.Transparency;
  protected override readonly includeClick = false;

  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(Enum.EasingStyle.Quad)
    .SetTime(this.attributes.TransparencyAnimation_Speed);

  public onStart(): void {
    super.onStart();
  }

  public active(): void {
    tween(this.instance, this.tweenInfo, {
      BackgroundTransparency: this.attributes.TransparencyAnimation_TransparencyGoal
    });
  }

  public inactive(): void {
    tween(this.instance, this.tweenInfo, {
      BackgroundTransparency: this.defaultTransparency
    });
  }
}