import Spring from "shared/classes/spring";

import type ProceduralAnimation from "../procedural-animation";

import type { CharacterController } from "client/controllers/character";

const { clamp } = math;

export default class LandingAnimation implements ProceduralAnimation {
  public readonly spring = new Spring(15, 80, 3.5, 4);
  public damping = 1.5;

  public constructor(
    private readonly character: CharacterController
  ) { }

  public start(): void { }

  public update(dt: number): Vector3 {
    this.shoveLandingSpring(this.character.mustGetRoot().AssemblyLinearVelocity.div(12 * this.damping));
    return this.spring.update(dt);
  }

  private shoveLandingSpring(fallingVelocity: Vector3): void {
    const velocity = clamp(fallingVelocity.Y / 4, -6, 0.25);
    this.spring.shove(new Vector3(0, velocity, 0));
    task.delay(0.115, () => this.spring.shove(new Vector3(0, -velocity, 0)));
  }
}