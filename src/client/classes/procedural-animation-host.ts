import Object from "@rbxts/object-utils";

import { combineCFrames } from "shared/utility/3D";
import { lerp } from "shared/utility/numbers";
import WalkCycleAnimation from "client/classes/procedural-animations/walk-cycle";
import MouseSwayAnimation from "client/classes/procedural-animations/mouse-sway";
import LandingAnimation from "client/classes/procedural-animations/landing";
import type ProceduralAnimation from "./procedural-animation";

import type { CharacterController } from "client/controllers/character";

const { min, rad } = math;

export class ProceduralAnimationHost<I extends Camera | Model> implements ProceduralAnimation<CFrame> {
  public readonly animations;
  public readonly cframeManipulators = {
    aim: new Instance("CFrameValue")
  };

  private readonly connectedToCamera;

  public constructor(
    private readonly instance: I,
    private readonly character: CharacterController
  ) {
    this.connectedToCamera = this.instance.IsA("Camera");
    this.animations = {
      walkCycle: new WalkCycleAnimation(this.character),
      mouseSway: new MouseSwayAnimation,
      landing: new LandingAnimation(this.character),
    };
  }

  public start(): void {
    for (const animation of Object.values(this.animations))
      animation.start();
  }

  public update(dt: number): CFrame {
    dt = min(dt, 1);
    const offset = this.connectedToCamera ? this.getCameraOffset(dt) : this.getModelOffset(dt);
    const finalManipulatorOffset = combineCFrames(Object.values(this.cframeManipulators).map(manipulator => manipulator.Value));
    return offset.mul(finalManipulatorOffset);
  }

  private getCameraOffset(dt: number): CFrame {
    const cameraOffsets: CFrame[] = [];
    {
      const movement = this.animations.walkCycle.update(dt).div(-4);
      cameraOffsets.push(
        new CFrame(0, movement.Y, 0)
          .mul(CFrame.Angles(movement.Y, movement.X / 3.5, movement.Z))
      );
    }
    {
      const movement = this.animations.mouseSway.update(dt);
      this.animations.mouseSway.angle = lerp(this.animations.mouseSway.angle, movement.X, 4 * dt);
      cameraOffsets.push(CFrame.Angles(0, 0, this.animations.mouseSway.angle));
    }
    {
      const movement = this.animations.landing.update(dt).div(8);
      cameraOffsets.push(
        new CFrame(0, movement.Y / 8, 0)
          .mul(CFrame.Angles(rad(movement.Y), 0, 0))
      );
    }

    return combineCFrames(cameraOffsets);
  }

  private getModelOffset(dt: number): CFrame {
    const modelOffsets: CFrame[] = [];
    {
      const movement = this.animations.walkCycle.update(dt).mul(16);
      modelOffsets.push(
        new CFrame(movement.X * 2, movement.Y * 2, 0)
          .mul(CFrame.Angles(movement.Y * 1.5, movement.X / 8, movement.Z))
      );
    }
    {
      const movement = this.animations.landing.update(dt).div(32);
      // const multiplier = this.fps.state.aimed ? 0.75 : 1;
      modelOffsets.push(
        new CFrame(0, -movement.Y, 0)
          .mul(CFrame.Angles(movement.Y, 0, 0))
      );
    }

    return combineCFrames(modelOffsets);
  }
}