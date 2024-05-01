import { Spring } from "shared/classes/spring";
import { flattenNumber } from "shared/utility/numbers";
import Wave from "shared/classes/wave";

import type ProceduralAnimation from "../procedural-animation";

import type { CharacterController } from "client/controllers/character";

const WAVE_PARAMETERS = <const>[1.5, 16, -1, 0];

export default class WalkCycleAnimation implements ProceduralAnimation {
  public readonly spring = new Spring;
  public readonly sineWave = new Wave(...WAVE_PARAMETERS);
  public readonly cosineWave = new Wave(...WAVE_PARAMETERS);
  public minimumSpeed = 0; // if u want

  public constructor(
    private readonly character: CharacterController
  ) { }

  public start(): void {
    this.cosineWave.phaseShift = 1;
    this.cosineWave.waveFunction = math.cos;
  }

  public update(dt: number): Vector3 {
    const root = this.character.getRoot();
    if (root === undefined)
      return this.spring.update(dt);

    const waveDamping = 700;
    const velocity = root.AssemblyLinearVelocity;
    const walkSpeed = flattenNumber(velocity.sub(new Vector3(0, velocity.Y, 0)).Magnitude, 0.04);
    this.sineWave.frequency = walkSpeed / 1.25;
    this.cosineWave.frequency = walkSpeed / 1.25;

    const doNotApplyWave = walkSpeed === 0 || walkSpeed < this.minimumSpeed;
    const x = doNotApplyWave ? 0 : this.sineWave.update(1, waveDamping);
    const y = doNotApplyWave ? 0 : this.cosineWave.update(1, waveDamping);
    const force = new Vector3(x, y, x) // x * (aimed ? 1 : 3), only for 1st coord
    // .div(aimed ? 5 : 1)
    // .mul(sprinting ? 1.4 : 1);

    this.spring.shove(force);
    return this.spring.update(dt);
  }
}