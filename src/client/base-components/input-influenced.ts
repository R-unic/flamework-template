import { Context as InputContext } from "@rbxts/gamejoy";
import DestroyableComponent from "shared/base-components/destroyable";

export class InputInfluenced<A extends {} = {}, I extends Instance = Instance> extends DestroyableComponent<A, I> {
  protected readonly input = new InputContext({
    ActionGhosting: 0,
    Process: false,
    RunSynchronously: true
  });
}