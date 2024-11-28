import Iris from "@rbxts/iris";

import { isNaN } from "shared/utility/numbers";
import type { ControlPanelDropdownRenderer } from "shared/structs/control-panel";

const { ceil, min, huge: INF } = math;

/*
  If delta time in the spring class is lower than this value,
  it will split up the update into multiple smaller updates
*/
const MAX_SPRING_DELTA = 1 / 40;

export class Spring implements ControlPanelDropdownRenderer {
  static readonly iterations = 8;

  public defaultPosition: Vector3;
  public target: Vector3;
  public position: Vector3;
  public velocity: Vector3;
  private lastPosition: Vector3;

  public constructor(
    public mass = 5,
    public force = 50,
    public damping = 4,
    public speed = 4,
    defaultPosition = new Vector3(0, 0, 0)
  ) {
    this.defaultPosition = defaultPosition;
    this.target = defaultPosition;
    this.position = defaultPosition;
    this.velocity = new Vector3();
    this.lastPosition = defaultPosition;
  }

  /**
   * Shove the spring off equilibrium
   *
   * @param force Force vector
   */
  public shove(force: Vector3): void {
    let { X, Y, Z } = force;
    if (isNaN(X) || X === INF || X === -INF) X = 0;
    if (isNaN(Y) || Y === INF || Y === -INF) Y = 0;
    if (isNaN(Z) || Z === INF || Z === -INF) Z = 0;
    this.velocity = this.velocity.add(new Vector3(X, Y, Z));
  }

  /**
   * Reset the spring to its default position
   */
  public resetTarget(): void {
    this.target = this.defaultPosition;
  }

  /**
   * Update the spring
   *
   * @param dt Delta time
   * @returns The difference between the current and last positions
   */
  public update(dt: number): Vector3 {
    if (dt > MAX_SPRING_DELTA) {
      const iter = ceil(dt / MAX_SPRING_DELTA);
      for (let i = 0; i < iter; i++) {
        this.update(dt / iter);
      }

      return this.position.sub(this.lastPosition);
    }

    const scaledDt: number = (min(dt, 1) * this.speed) / Spring.iterations;
    for (let i = 0; i < Spring.iterations; i++) {
      const force: Vector3 = this.target.sub(this.position);
      const acceleration: Vector3 = force
        .mul(this.force)
        .div(this.mass)
        .sub(this.velocity.mul(this.damping));

      this.velocity = this.velocity.add(acceleration.mul(scaledDt));
      this.position = this.position.add(this.velocity.mul(scaledDt));
    }

    const positionDifference = this.position.sub(this.lastPosition);
    this.lastPosition = this.position;
    return positionDifference;
  }

  public renderControlPanelDropdown(prefix?: string): void {
    Iris.Tree([(prefix !== undefined ? prefix + " " : "") + "Spring"]);

    const mass = Iris.SliderNum(["Mass", 0.25, 0.25, 100], { number: Iris.State(this.mass) });
    if (mass.numberChanged())
      this.mass = mass.state.number.get();

    const force = Iris.SliderNum(["Force", 0.25, 0.25, 100], { number: Iris.State(this.force) });
    if (force.numberChanged())
      this.force = force.state.number.get();

    const damping = Iris.SliderNum(["Damping", 0.25, 0.25, 100], { number: Iris.State(this.damping) });
    if (damping.numberChanged())
      this.damping = damping.state.number.get();

    const speed = Iris.SliderNum(["Speed", 0.25, 0.25, 100], { number: Iris.State(this.speed) });
    if (speed.numberChanged())
      this.speed = speed.state.number.get();

    Iris.End();
  }
}