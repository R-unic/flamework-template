import { Controller } from "@flamework/core";

import { Player } from "shared/utility/client";

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
    return <Maybe<CharacterModel["HumanoidRootPart"]>>this.get()?.FindFirstChild("HumanoidRootPart");
  }

  public mustGetRoot(): CharacterModel["HumanoidRootPart"] {
    return <CharacterModel["HumanoidRootPart"]>this.mustGet().WaitForChild("HumanoidRootPart");
  }

  public getHumanoid(): Maybe<CharacterModel["Humanoid"]> {
    return <Maybe<CharacterModel["Humanoid"]>>this.get()?.FindFirstChild("Humanoid");
  }

  public mustGetHumanoid(): CharacterModel["Humanoid"] {
    return <CharacterModel["Humanoid"]>this.mustGet().WaitForChild("Humanoid");
  }
}