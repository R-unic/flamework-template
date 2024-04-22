import { Controller } from "@flamework/core";

import { Player } from "shared/utility/client";

interface CharacterModel extends Model {
  PrimaryPart: Part;
  Humanoid: Humanoid;
  Head: Part;
}

@Controller()
export class CharacterController {
  public get(): Maybe<CharacterModel> {
    return <Maybe<CharacterModel>>Player.Character;
  }

  public getRoot(): Maybe<BasePart> {
    return this.getHumanoid()?.RootPart;
  }

  public getHumanoid(): Maybe<Humanoid> {
    return this.get()?.Humanoid;
  }
}