import { OnRender, OnStart } from "@flamework/core";
import { Component } from "@flamework/components";

import { Spring } from "shared/classes/spring";
import BaseButtonAnimation from "client/base-components/base-button-animation";

interface Attributes {
  readonly ScaleIncrement: number;
  readonly SpringMass: number;
  readonly SpringForce: number;
  readonly SpringDamping: number;
  readonly SpringSpeed: number;
}

@Component({
  tag: "SpringScaleAnimation",
  defaults: {
    ScaleIncrement: 0.2,
    SpringMass: 5,
    SpringForce: 70,
    SpringDamping: 3,
    Speed: 6
  }
})
export class SpringScaleAnimation extends BaseButtonAnimation<Attributes> implements OnStart, OnRender {
  private readonly scale = this.instance.FindFirstChildOfClass("UIScale") ?? new Instance("UIScale", this.instance);
  private readonly defaultScale = this.scale.Scale;
  private readonly scaleIncrement = this.attributes.ScaleIncrement;
  private readonly spring = new Spring(
    this.attributes.SpringMass,
    this.attributes.SpringForce,
    this.attributes.SpringDamping,
    this.attributes.SpringSpeed
  );

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