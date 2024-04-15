import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";

import { tween } from "shared/utility/ui";
import ButtonTweenAnimation from "client/base-components/button-tween-animation";

interface Attributes {
  RotationGoal: number;
  Speed: number;
}

const { EasingStyle } = Enum;

@Component({
  tag: "RotationAnimation",
  defaults: {
    RotationGoal: 15,
    Speed: 0.35
  }
})
export class RotationAnimation extends ButtonTweenAnimation<Attributes> implements OnStart {
  private readonly defaultRotation = this.instance.Rotation;
  protected override readonly includeClick = false;

  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(EasingStyle.Quad)
    .SetTime(this.attributes.Speed);

  public onStart(): void {
    super.onStart();
  }

  public active(): void {
    tween(this.instance, this.tweenInfo, {
      Rotation: this.attributes.RotationGoal
    });
  }

  public inactive(): void {
    tween(this.instance, this.tweenInfo, {
      Rotation: this.defaultRotation
    });
  }
}