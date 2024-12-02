import Wave from "@rbxts/wave";

import { Singleton } from "shared/decorators";
import { Spring } from "shared/classes/spring";
import { ProceduralAnimation, BaseProceduralAnimation, ProceduralAnimationInstance } from "../procedural-animation-host";

import type { CharacterController } from "client/controllers/character";

const { round, cos } = math;

const WAVE_DAMPING = 900;
const BASE_AMPLITUDE = 1.5;
const BASE_FREQUENCY = 16;
const BASE_VERTICAL_SHIFT = -1;

@Singleton()
@ProceduralAnimation(ProceduralAnimationInstance.Any)
export class WalkCycleAnimation extends BaseProceduralAnimation {
  public readonly spring = new Spring;
  public readonly sineWave = new Wave(BASE_AMPLITUDE, BASE_FREQUENCY, BASE_VERTICAL_SHIFT, 0, WAVE_DAMPING);
  public readonly cosineWave = new Wave(BASE_AMPLITUDE, BASE_FREQUENCY, BASE_VERTICAL_SHIFT, 1, WAVE_DAMPING, cos);
  public damping = -6;
  public minimumSpeed = 1; // if you want

  public constructor(
    private readonly character: CharacterController
  ) { super(); }

  public getCFrame(dt: number): CFrame {
    const movement = this.update(dt);
    return new CFrame(0, movement.Y, 0)
      .mul(CFrame.Angles(movement.Y, movement.X / 3.5, movement.Z));
  }

  protected update(dt: number): Vector3 {
    const root = this.character.getRoot();
    if (root === undefined)
      return this.spring.update(dt);

    const velocity = root.AssemblyLinearVelocity.mul(60);
    const walkSpeed = velocity.mul(new Vector3(1, 0, 1)).Magnitude;
    this.sineWave.frequency = round(walkSpeed) / 1.25;
    this.cosineWave.frequency = round(walkSpeed) / 1.25;

    const doNotApplyWave = walkSpeed === 0 || walkSpeed < this.minimumSpeed;
    const x = doNotApplyWave ? 0 : this.sineWave.update(1);
    const y = doNotApplyWave ? 0 : this.cosineWave.update(1);
    const force = new Vector3(x, y, x);

    this.spring.shove(force);
    return this.spring.update(dt).div(this.damping);
  }
}