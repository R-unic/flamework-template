import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";

import { tween } from "shared/utility/ui";
import ButtonTweenAnimation from "client/base-components/button-tween-animation";

interface Attributes {
  OffsetGoal: Vector2;
  Speed: number;
}

const { EasingStyle } = Enum;

@Component({
  tag: "GradientAnimation",
  defaults: {
    OffsetGoal: 0.15,
    Speed: 0.1
  }
})
export class GradientAnimation extends ButtonTweenAnimation<Attributes, GuiButton & { UIGradient: UIGradient; }> implements OnStart {
  private readonly defaultOffset = this.instance.UIGradient.Offset;

  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(EasingStyle.Quad)
    .SetTime(this.attributes.Speed);

  public onStart(): void {
    super.onStart();
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