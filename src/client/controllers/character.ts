import { Controller } from "@flamework/core";

import { Player } from "client/utility";
import { promisifyEvent } from "shared/utility/promises";

@Controller()
export class CharacterController {
  public isAlive(): boolean {
    const humanoid = this.getHumanoid();
    return humanoid !== undefined && humanoid.Health > 0;
  }

  public get(): Maybe<CharacterModel> {
    return <Maybe<CharacterModel>>Player.Character;
  }

  public async waitFor(): Promise<CharacterModel> {
    const [character] = await promisifyEvent<[character: CharacterModel]>(Player.CharacterAdded);
    return character;
  }

  public async mustGet(): Promise<CharacterModel> {
    return this.get() ?? await this.waitFor();
  }

  public getRoot(): Maybe<CharacterModel["HumanoidRootPart"]> {
    return this.get()?.FindFirstChild("HumanoidRootPart");
  }

  public async mustGetRoot(): Promise<CharacterModel["HumanoidRootPart"]> {
    return (await this.mustGet()).WaitForChild("HumanoidRootPart");
  }

  public getHumanoid(): Maybe<CharacterModel["Humanoid"]> {
    return this.get()?.FindFirstChild("Humanoid");
  }

  public async mustGetHumanoid(): Promise<CharacterModel["Humanoid"]> {
    return (await this.mustGet()).WaitForChild("Humanoid");
  }
}