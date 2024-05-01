import { BaseComponent } from "@flamework/components";
import Object from "@rbxts/object-utils";

import BreathingAnimation from "client/classes/procedural-animations/breathing";
import WalkCycleAnimation from "client/classes/procedural-animations/walk-cycle";
import MouseSwayAnimation from "client/classes/procedural-animations/mouse-sway";
import LandingAnimation from "client/classes/procedural-animations/landing";

import type { CharacterController } from "client/controllers/character";

const { min, rad } = math;

export class ProceduralAnimations<A = {}, I extends Camera | Model = Camera | Model> extends BaseComponent<A, I> {
  public readonly cframeManipulators = {
    aim: new Instance("CFrameValue")
  };

  private readonly connectedToCamera = this.instance.IsA("Camera");
  public readonly animations;

  public constructor(
    private readonly character: CharacterController
  ) {
    super();
    this.animations = {
      breathing: new BreathingAnimation,
      walkCycle: new WalkCycleAnimation(this.character),
      mouseSway: new MouseSwayAnimation,
      landing: new LandingAnimation(this.character),
    };
  }

  protected startProceduralAnimations(): void {
    for (const animation of Object.values(this.animations))
      animation.start();
  }

  protected updateProceduralAnimations(dt: number): CFrame {
    dt = min(dt, 1);
    const offset = this.connectedToCamera ? this.getCameraOffset(dt) : this.getModelOffset(dt);
    const finalManipulatorOffset = this.combineCFrames(Object.values(this.cframeManipulators).map(manipulator => manipulator.Value));
    return offset.mul(finalManipulatorOffset);
  }

  private getCameraOffset(dt: number): CFrame {
    const cameraOffsets: CFrame[] = [];
    {
      const movement = this.animations.breathing.update(dt);
      cameraOffsets.push(new CFrame(0, movement.Y * 2, 0));
    }
    {
      const movement = this.animations.walkCycle.update(dt).div(-4);
      cameraOffsets.push(
        new CFrame(0, movement.Y, 0)
          .mul(CFrame.Angles(movement.Y, movement.X / 3.5, movement.Z))
      );
    }
    {
      const movement = this.animations.landing.update(dt).div(8);
      cameraOffsets.push(
        new CFrame(0, movement.Y / 8, 0)
          .mul(CFrame.Angles(rad(movement.Y), 0, 0))
      );
    }

    return this.combineCFrames(cameraOffsets);
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
      const movement = this.animations.mouseSway.update(dt).mul(1.25);
      const sway = new CFrame(-movement.X * 1.75, movement.Y / 1.5, -movement.X * 1.5)
        .mul(CFrame.Angles(-movement.Y / 1.5, -movement.X, 0));

      modelOffsets.push(sway);
    }
    {
      const movement = this.animations.landing.update(dt).div(32);
      // const multiplier = this.fps.state.aimed ? 0.75 : 1;
      modelOffsets.push(
        new CFrame(0, -movement.Y, 0)
          .mul(CFrame.Angles(movement.Y, 0, 0))
      );
    }

    return this.combineCFrames(modelOffsets);
  }

  private combineCFrames(cframes: CFrame[]): CFrame {
    return cframes.reduce((sum, cf) => sum.mul(cf), new CFrame);
  }
}