import { Controller } from "@flamework/core";
import type { Components } from "@flamework/components";

import { Player } from "shared/utility/client";

@Controller()
export class CharacterController {
  public constructor(
    private readonly components: Components
  ) { }

  public get(): Maybe<CharacterModel> {
    return <Maybe<CharacterModel>>Player.Character;
  }

  public waitFor(): CharacterModel {
    return <CharacterModel>Player.CharacterAdded.Wait()[0];
  }

  public mustGet(): CharacterModel {
    return this.get() ?? this.waitFor();
  }

  public getRoot(): Maybe<BasePart> {
    return this.getHumanoid()?.RootPart;
  }

  public mustGetRoot(): BasePart {
    return this.mustGetHumanoid().RootPart!;
  }

  public getHumanoid(): Maybe<Humanoid> {
    return this.get()?.Humanoid;
  }

  public mustGetHumanoid(): Humanoid {
    return this.mustGet().Humanoid;
  }
}