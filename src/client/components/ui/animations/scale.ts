import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";

import { tween } from "shared/utility/ui";
import ButtonTweenAnimation from "client/base-components/button-tween-animation";

const { EasingStyle } = Enum;

interface Attributes {
  ScaleIncrement?: number;
  Speed?: number;
}

@Component({ tag: "ScaleAnimation" })
export class ScaleAnimation extends ButtonTweenAnimation<Attributes> implements OnStart {
  private readonly scale = this.instance.FindFirstChildOfClass("UIScale") ?? new Instance("UIScale", this.instance);
  private readonly defaultScale = this.scale.Scale;
  private readonly scaleIncrement = this.attributes.ScaleIncrement ?? 0.05;

  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(EasingStyle.Sine)
    .SetTime(this.attributes.Speed ?? 0.35);

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