import Iris from "@rbxts/iris";

import { Singleton } from "shared/decorators";
import { Spring } from "shared/classes/spring";
import { doubleSidedLimit } from "shared/utility/numbers";
import { ProceduralAnimation, BaseProceduralAnimation, ProceduralAnimationInstance } from "../procedural-animation-host";
import type { ControlPanelDropdownRenderer } from "shared/structs/control-panel";

import type { MouseController } from "client/controllers/mouse";

@Singleton()
@ProceduralAnimation(ProceduralAnimationInstance.Model)
export class MouseSwayAnimation extends BaseProceduralAnimation implements ControlPanelDropdownRenderer {
  private readonly horizontalDamping = 0.5;

  private readonly spring = new Spring(4, 25, 16, 3.5);
  private damping = 450;
  private limit = 0.018;

  public constructor(
    private readonly mouse: MouseController
  ) { super(); }

  public getCFrame(dt: number): CFrame {
    const movement = this.update(dt).div(this.damping);
    const rotationalMovement = movement.X / 2;

    return new CFrame(-movement.X / this.horizontalDamping, movement.Y * 1.25, 0)
      .mul(CFrame.Angles(-movement.Y * 1.25, -movement.X, rotationalMovement));
  }

  public renderControlPanelDropdown(): void {
    Iris.Tree(["Mouse Sway"]);
    {
      const dampingSlider = Iris.SliderNum(["Damping", 1, 1, 500], { number: Iris.State(this.damping) });
      if (dampingSlider.numberChanged())
        this.damping = dampingSlider.state.number.get();

      const limitSlider = Iris.SliderNum(["Limit", 0.005, 0.005, 0.15], { number: Iris.State(this.limit) });
      if (limitSlider.numberChanged())
        this.limit = limitSlider.state.number.get();

      this.spring.renderControlPanelDropdown();
    }
    Iris.End();
  }

  protected update(dt: number): Vector3 {
    const { X, Y } = this.mouse.getDelta().div(this.damping);
    const swayForce = new Vector3(
      doubleSidedLimit(X, this.limit),
      doubleSidedLimit(Y, this.limit),
      0
    );

    this.spring.shove(swayForce);
    return this.spring.update(dt).mul(1.25);
  }
}