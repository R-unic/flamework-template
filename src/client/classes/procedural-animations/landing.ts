import { Singleton } from "shared/decorators";
import { Spring } from "shared/classes/spring";
import { ProceduralAnimation, BaseProceduralAnimation, ProceduralAnimationInstance } from "../procedural-animation-host";

import type { CharacterController } from "client/controllers/character";

const { clamp, rad } = math;

@Singleton()
@ProceduralAnimation(ProceduralAnimationInstance.Camera)
export class LandingAnimation extends BaseProceduralAnimation {
  private readonly spring = new Spring(15, 80, 3.5, 4);
  private angularDamping = 2;
  private intensity = 1.5;

  public constructor(
    private readonly character: CharacterController
  ) { super(); }

  public getCFrame(dt: number): CFrame {
    const movement = this.update(dt).div(8);

    return new CFrame(0, movement.Y / 8, 0)
      .mul(CFrame.Angles(rad(movement.Y), 0, 0))
  }

  protected update(dt: number): Vector3 {
    this.shoveLandingSpring(this.character.mustGetRoot().AssemblyLinearVelocity.div(12 * this.intensity));
    return this.spring.update(dt);
  }

  private shoveLandingSpring(fallingVelocity: Vector3): void {
    const velocity = clamp(fallingVelocity.Y / 4, -6, 0.25);
    this.spring.shove(new Vector3(0, velocity, 0));
    task.delay(0.115, () => this.spring.shove(new Vector3(0, -velocity, -velocity / this.angularDamping)));
  }
}