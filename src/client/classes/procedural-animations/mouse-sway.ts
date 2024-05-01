import { UserInputService } from "@rbxts/services";

import { Player } from "shared/utility/client";
import Spring from "shared/classes/spring";

import type ProceduralAnimation from "../procedural-animation";

const { clamp } = math;

export default class MouseSwayAnimation implements ProceduralAnimation {
  public readonly spring = new Spring;
  public damping = 1;

  private readonly mouse = Player.GetMouse();
  private lastX = this.mouse.X;
  private lastY = this.mouse.Y;

  public start(): void { }

  public update(dt: number): Vector3 {
    const { X, Y } = this.getDelta().div(300);
    const limit = 0.05 / (this.damping / 1.35);
    const swayForce = new Vector3(
      clamp(X, -limit, limit),
      clamp(Y, -limit, limit)
    );

    this.spring.shove(swayForce);
    return this.spring.update(dt).div(this.damping);
  }

  private getDelta(): Vector2 {
    if (Player.CameraMode === Enum.CameraMode.LockFirstPerson)
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