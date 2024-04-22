import { Context as InputContext } from "@rbxts/gamejoy";

export class InputInfluenced {
  protected readonly input = new InputContext({
    ActionGhosting: 0,
    Process: false,
    RunSynchronously: true
  });
}