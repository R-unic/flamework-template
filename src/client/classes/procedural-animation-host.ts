import { getChildrenOfType } from "@rbxts/instance-utility";
import { processDependency } from "@rbxts/flamework-meta-utils";
import Object from "@rbxts/object-utils";

import { createMappingDecorator } from "shared/utility/meta";

const { min } = math;

type ProceduralAnimationDecoratorArgs = [instance: ProceduralAnimationInstance];
const [animationClassMap, ProceduralAnimation] = createMappingDecorator<BaseProceduralAnimation, never[], ProceduralAnimationDecoratorArgs>();
export { ProceduralAnimation };

export const enum ProceduralAnimationInstance {
  Camera,
  Model,
  Any
}

export abstract class BaseProceduralAnimation {
  protected abstract update(dt: number): Vector3;
  public abstract getCFrame(dt: number): CFrame;
}

function combineCFrames(cframes: CFrame[]): CFrame {
  return cframes.reduce((sum, cf) => sum.mul(cf), new CFrame);
}

export class ProceduralAnimationHost<I extends Camera | Model = Camera | Model> {
  private readonly cframeManipulators = {
    aim: new Instance("CFrameValue")
  };

  private readonly animations: [BaseProceduralAnimation, ProceduralAnimationDecoratorArgs][] = [];
  private readonly connectedToCamera: boolean;

  public constructor(
    private readonly target: I
  ) {
    this.connectedToCamera = this.target.IsA("Camera");

    for (const animationModule of getChildrenOfType(script.Parent!.WaitForChild("procedural-animations"), "ModuleScript"))
      require(animationModule);

    for (const [ProceduralAnimation, args] of Object.values(animationClassMap))
      processDependency(ProceduralAnimation, animation => this.animations.push([animation, args]));
  }

  public update(dt: number): CFrame {
    dt = min(dt, 1);
    const offset = this.getOffset(dt);
    const finalManipulatorOffset = combineCFrames(Object.values(this.cframeManipulators).map(manipulator => manipulator.Value));
    return offset.mul(finalManipulatorOffset);
  }

  private getOffset(dt: number): CFrame {
    const offsets: CFrame[] = [];
    for (const [animation, [instance]] of this.animations) {
      if (instance === ProceduralAnimationInstance.Camera && !this.connectedToCamera) continue;
      if (instance === ProceduralAnimationInstance.Model && this.connectedToCamera) continue;
      offsets.push(animation.getCFrame(dt));
    }

    return combineCFrames(offsets);
  }
}