import { Controller } from "@flamework/core";

import { Player } from "client/utility";

@Controller()
export class CharacterController {
  public isAlive(): boolean {
    const humanoid = this.getHumanoid();
    return humanoid !== undefined && humanoid.Health > 0;
  }

  public get(): Maybe<CharacterModel> {
    return <Maybe<CharacterModel>>Player.Character;
  }

  public waitFor(): CharacterModel {
    return <CharacterModel>Player.CharacterAdded.Wait()[0];
  }

  public mustGet(): CharacterModel {
    return this.get() ?? this.waitFor();
  }

  public getRoot(): Maybe<CharacterModel["HumanoidRootPart"]> {
    return this.get()?.FindFirstChild<CharacterModel["HumanoidRootPart"]>("HumanoidRootPart");
  }

  public mustGetRoot(): CharacterModel["HumanoidRootPart"] {
    return this.mustGet().WaitForChild<CharacterModel["HumanoidRootPart"]>("HumanoidRootPart");
  }

  public getHumanoid(): Maybe<CharacterModel["Humanoid"]> {
    return this.get()?.FindFirstChild<CharacterModel["Humanoid"]>("Humanoid");
  }

  public mustGetHumanoid(): CharacterModel["Humanoid"] {
    return this.mustGet().WaitForChild<CharacterModel["Humanoid"]>("Humanoid");
  }
}