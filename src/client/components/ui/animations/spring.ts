import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";

import { tween } from "shared/utilities/ui";
import ButtonAnimation from "client/base-components/button-animation";

const { EasingStyle } = Enum;

interface Attributes {
  ScaleIncrement?: number;
  Speed?: number;
}

@Component({ tag: "SpringAnimation" })
export class SpringAnimation extends ButtonAnimation<Attributes> implements OnStart {
  private readonly scale = this.instance.FindFirstChildOfClass("UIScale") ?? new Instance("UIScale", this.instance);
  private readonly scaleIncrement = this.attributes.ScaleIncrement ?? 0.05;

  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(EasingStyle.Elastic)
    .SetTime(this.attributes.Speed ?? 0.35);

  public onStart(): void {
    this.connectEvents();
  }

  protected inactive(): void {
    tween(this.scale, this.tweenInfo, {
      Scale: 1
    });
  }

  protected active(): void {
    tween(this.scale, this.tweenInfo, {
      Scale: 1 + this.scaleIncrement
    });
  }
}