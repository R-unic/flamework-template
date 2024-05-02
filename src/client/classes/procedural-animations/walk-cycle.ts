import Spring from "shared/classes/spring";
import Wave from "shared/classes/wave";

import type ProceduralAnimation from "../procedural-animation";

import type { CharacterController } from "client/controllers/character";

const { round, cos } = math;

const WAVE_PARAMETERS = <const>[1.5, 16, -1, 0];

export default class WalkCycleAnimation implements ProceduralAnimation {
  public readonly spring = new Spring;
  public readonly sineWave = new Wave(...WAVE_PARAMETERS);
  public readonly cosineWave = new Wave(...WAVE_PARAMETERS);
  public damping = 1.5;
  public minimumSpeed = 1; // if u want

  public constructor(
    private readonly character: CharacterController
  ) { }

  public start(): void {
    this.cosineWave.phaseShift = 1;
    this.cosineWave.waveFunction = cos;
  }

  public update(dt: number): Vector3 {
    const movement = this.character.getMovement();
    if (movement === undefined)
      return this.spring.update(dt);

    const waveDamping = 900;
    const velocity = movement.getVelocity().mul(60);
    const walkSpeed = velocity.sub(new Vector3(0, velocity.Y, 0)).Magnitude;
    this.sineWave.frequency = round(walkSpeed) / 1.25;
    this.cosineWave.frequency = round(walkSpeed) / 1.25;

    const doNotApplyWave = walkSpeed === 0 || walkSpeed < this.minimumSpeed;
    const x = doNotApplyWave ? 0 : this.sineWave.update(1, waveDamping);
    const y = doNotApplyWave ? 0 : this.cosineWave.update(1, waveDamping);
    const force = new Vector3(x, y, x); // x * (aimed ? 1 : 3), only for 1st coord
    // .div(aimed ? 5 : 1)
    // .mul(sprinting ? 1.4 : 1);

    this.spring.shove(force);
    return this.spring.update(dt).div(this.damping);
  }
}