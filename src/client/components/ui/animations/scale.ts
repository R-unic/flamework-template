import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { tween } from "@rbxts/instance-utility";
import { $nameof } from "rbxts-transform-debug";

import ButtonTweenAnimation from "client/base-components/button-tween-animation";

interface Attributes {
  readonly ScaleAnimation_ScaleIncrement: number;
  readonly ScaleAnimation_Speed: number;
}

@Component({
  tag: $nameof<ScaleAnimation>(),
  defaults: {
    ScaleAnimation_ScaleIncrement: 0.05,
    ScaleAnimation_Speed: 0.35
  }
})
export class ScaleAnimation extends ButtonTweenAnimation<Attributes> implements OnStart {
  private readonly scale = this.instance.FindFirstChildOfClass("UIScale") ?? new Instance("UIScale", this.instance);
  private readonly defaultScale = this.scale.Scale;
  private readonly scaleIncrement = this.attributes.ScaleAnimation_ScaleIncrement;

  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(Enum.EasingStyle.Sine)
    .SetTime(this.attributes.ScaleAnimation_Speed)
    .Build();

  public onStart(): void {
    super.onStart();
  }

  protected inactive(): void {
    tween(this.scale, this.tweenInfo, {
      Scale: this.defaultScale
    });
  }

  protected active(): void {
    tween(this.scale, this.tweenInfo, {
      Scale: this.defaultScale + this.scaleIncrement
    });
  }
}