import { Singleton } from "shared/decorators";
import { Spring } from "shared/classes/spring";
import { ProceduralAnimation, BaseProceduralAnimation, ProceduralAnimationInstance } from "../procedural-animation-host";

import type { CharacterController } from "client/controllers/character";

const { clamp, rad } = math;

@Singleton()
@ProceduralAnimation(ProceduralAnimationInstance.Camera)
export class LandingAnimation extends BaseProceduralAnimation {
  private readonly spring = new Spring(15, 80, 3.5, 4);
  private readonly damping = 4;
  private readonly angularDamping = 2;
  private readonly intensity = 1.5;

  public constructor(
    private readonly character: CharacterController
  ) { super(); }

  public getCFrame(dt: number): CFrame {
    const movement = this.update(dt).div(this.damping);
    return new CFrame(0, movement.Y / this.damping, 0)
      .mul(CFrame.Angles(rad(movement.Y), 0, 0))
  }

  protected update(dt: number): Vector3 {
    const root = this.character.getRoot();
    if (root === undefined)
      return this.spring.update(dt);

    this.shoveLandingSpring(root.AssemblyLinearVelocity.div(12 * this.intensity));
    return this.spring.update(dt);
  }

  private shoveLandingSpring(fallingVelocity: Vector3): void {
    const velocity = clamp(fallingVelocity.Y / 4, -6, 0.25);
    this.spring.shove(new Vector3(0, velocity, 0));
    task.delay(0.115, () => this.spring.shove(new Vector3(0, -velocity, -velocity / this.angularDamping)));
  }
}