import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { tween } from "@rbxts/instance-utility";
import { $nameof } from "rbxts-transform-debug";

import ButtonTweenAnimation from "client/base-components/button-tween-animation";

interface Attributes {
  readonly GradientAnimation_OffsetGoal: Vector2;
  readonly GradientAnimation_Speed: number;
}

@Component({
  tag: $nameof<GradientAnimation>(),
  defaults: {
    GradientAnimation_OffsetGoal: 0.15,
    GradientAnimation_Speed: 0.1
  }
})
export class GradientAnimation extends ButtonTweenAnimation<Attributes, GuiButton & { UIGradient: UIGradient; }> implements OnStart {
  private readonly defaultOffset = this.instance.UIGradient.Offset;

  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(Enum.EasingStyle.Quad)
    .SetTime(this.attributes.GradientAnimation_Speed)
    .Build();

  public onStart(): void {
    super.onStart();
  }

  public active(): void {
    tween(this.instance.UIGradient, this.tweenInfo, {
      Offset: this.attributes.GradientAnimation_OffsetGoal
    });
  }

  public inactive(): void {
    tween(this.instance.UIGradient, this.tweenInfo, {
      Offset: this.defaultOffset
    });
  }
}