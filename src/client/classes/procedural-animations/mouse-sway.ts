import { UserInputService } from "@rbxts/services";

import { Player } from "shared/utility/client";

import type ProceduralAnimation from "../procedural-animation";

const { clamp } = math;

export default class MouseSwayAnimation implements ProceduralAnimation {
  public damping = 1;
  public limit = 1;
  public angle = 0;

  private readonly mouse = Player.GetMouse();
  private lastX = this.mouse.X;
  private lastY = this.mouse.Y;

  public start(): void { }

  public update(dt: number): Vector3 {
    const { X, Y } = this.getDelta().div(1500).div(this.damping);
    return new Vector3(
      clamp(X, -this.limit, this.limit),
      clamp(Y, -this.limit, this.limit),
      0
    );
  }

  private getDelta(): Vector2 {
    if (UserInputService.MouseBehavior === Enum.MouseBehavior.LockCenter)
      return UserInputService.GetMouseDelta();

    const delta = new Vector2(
      this.mouse.X - this.lastX,
      this.mouse.Y - this.lastY
    );

    this.lastX = this.mouse.X;
    this.lastY = this.mouse.Y;
    return delta;
  }
}