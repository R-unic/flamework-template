import type { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import Signal from "@rbxts/signal";

import { PlayerGui } from "shared/utility/client";
import { tween } from "shared/utility/ui";

import DestroyableComponent from "shared/base-components/destroyable";

interface Attributes {
  ToggleSwitch_InitialState: boolean;
  ToggleSwitch_EnabledColor: Color3;
  ToggleSwitch_DisabledColor: Color3;
}

@Component({
  tag: "ToggleSwitch",
  ancestorWhitelist: [PlayerGui],
  defaults: {
    ToggleSwitch_InitialState: false,
    ToggleSwitch_EnabledColor: Color3.fromRGB(70, 224, 120),
    ToggleSwitch_DisabledColor: Color3.fromRGB(200, 200, 200)
  }
})
export class ToggleSwitch extends DestroyableComponent<Attributes, ToggleSwitchButton> implements OnStart {
  public readonly toggled = new Signal<(on: boolean) => void>;

  private readonly tweenInfo = new TweenInfoBuilder()
    .SetTime(0.2)
    .SetEasingStyle(Enum.EasingStyle.Cubic)
    .SetEasingDirection(Enum.EasingDirection.Out);

  private on = this.attributes.ToggleSwitch_InitialState;

  public onStart(): void {
    this.toggle(this.on);
    this.janitor.Add(this.instance.MouseButton1Click.Connect(() => this.toggle(!this.on)));
  }

  public toggle(on: boolean): void {
    this.on = on;
    this.toggled.Fire(this.on);

    tween(this.instance, this.tweenInfo, {
      BackgroundColor3: this.on ? this.attributes.ToggleSwitch_EnabledColor : this.attributes.ToggleSwitch_DisabledColor
    });
    tween(this.instance.Node, this.tweenInfo, {
      AnchorPoint: new Vector2(on ? 1 : 0, 0.5),
      Position: UDim2.fromScale(on ? 1 : 0, 0.5)
    });
  }
}