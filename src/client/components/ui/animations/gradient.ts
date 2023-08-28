import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";

import { tween } from "shared/utilities/ui";
import ButtonAnimation from "client/base-components/button-animation";

interface Attributes {
  OffsetGoal: Vector2;
  Speed?: number;
}

const { EasingStyle } = Enum;

@Component({ tag: "GradientAnimation" })
export class GradientAnimation extends ButtonAnimation<Attributes, GuiButton & { UIGradient: UIGradient; }> implements OnStart {
  private readonly defaultOffset = this.instance.UIGradient.Offset;

  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(EasingStyle.Quad)
    .SetTime(this.attributes.Speed ?? 0.1);

  public onStart(): void {
    this.connectEvents();
  }

  public active(): void {
    tween(this.instance.UIGradient, this.tweenInfo, {
      Offset: this.attributes.OffsetGoal
    });
  }

  public inactive(): void {
    tween(this.instance.UIGradient, this.tweenInfo, {
      Offset: this.defaultOffset
    });
  }
}