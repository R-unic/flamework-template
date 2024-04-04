import { OnRender, OnStart } from "@flamework/core";
import { Component } from "@flamework/components";

import { Spring } from "shared/classes/spring";
import ButtonAnimation from "client/base-components/button-animation";

interface Attributes {
  ScaleIncrement: number;
  Speed: number;
}

@Component({
  tag: "SpringScaleAnimation",
  defaults: {
    ScaleIncrement: 0.2,
    Speed: 1
  }
})
export class SpringScaleAnimation extends ButtonAnimation<Attributes> implements OnStart, OnRender {
  private readonly scale = this.instance.FindFirstChildOfClass("UIScale") ?? new Instance("UIScale", this.instance);
  private readonly defaultScale = this.scale.Scale;
  private readonly scaleIncrement = this.attributes.ScaleIncrement;
  private readonly spring = new Spring(5, 70, 3, this.attributes.Speed * 6);

  protected active = undefined;
  protected inactive = undefined;

  public onStart(): void {
    super.onStart();
  }

  public onRender(dt: number): void {
    if (this.hovered)
      this.spring.shove(new Vector3(this.scaleIncrement, 0, 0));

    const movement = this.spring.update(dt);
    this.scale.Scale = this.defaultScale + movement.X;
  }
}