import { Spring } from "shared/classes/spring";

import type ProceduralAnimation from "../procedural-animation";

import type { CharacterController } from "client/controllers/character";

const { clamp, abs } = math;

export default class LandingAnimation implements ProceduralAnimation {
  public readonly spring = new Spring(2, 40, 4, 4);
  public damping = 1;

  public constructor(
    private readonly character: CharacterController
  ) { }

  public start(): void { }

  public update(dt: number): Vector3 {
    this.shoveLandingSpring(this.character.mustGetRoot().AssemblyLinearVelocity.div(12 * this.damping));
    return this.spring.update(dt);
  }

  private shoveLandingSpring(fallingVelocity: Vector3) {
    const velocity = clamp(-abs(fallingVelocity.Y), -80, 0);
    this.spring.shove(new Vector3(0, velocity, 0));
    task.delay(0.11, () => this.spring.shove(new Vector3(0, -velocity, 0)));
  }
}