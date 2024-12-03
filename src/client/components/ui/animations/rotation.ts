import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { tween } from "@rbxts/instance-utility";
import { $nameof } from "rbxts-transform-debug";

import ButtonTweenAnimation from "client/base-components/button-tween-animation";

interface Attributes {
  readonly RotationAnimation_RotationGoal: number;
  readonly RotationAnimation_Speed: number;
}

@Component({
  tag: $nameof<RotationAnimation>(),
  defaults: {
    RotationAnimation_RotationGoal: 15,
    RotationAnimation_Speed: 0.35
  }
})
export class RotationAnimation extends ButtonTweenAnimation<Attributes> implements OnStart {
  private readonly defaultRotation = this.instance.Rotation;
  protected override readonly includeClick = false;

  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(Enum.EasingStyle.Quad)
    .SetTime(this.attributes.RotationAnimation_Speed)
    .Build();

  public onStart(): void {
    super.onStart();
  }

  public active(): void {
    tween(this.instance, this.tweenInfo, {
      Rotation: this.attributes.RotationAnimation_RotationGoal
    });
  }

  public inactive(): void {
    tween(this.instance, this.tweenInfo, {
      Rotation: this.defaultRotation
    });
  }
}