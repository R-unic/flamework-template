import { Controller } from "@flamework/core";

import type { LogStart } from "shared/hooks";
import { OnInput, OnInputRelease } from "client/decorators";
import { StandardActionBuilder } from "@rbxts/mechanism";

export const enum ActionID {
  LMB,
  RMB,
  MMB,
  LeftTrigger,
  RightTrigger,
  Crouch
}

/** Handles all game input */
@Controller()
export class InputController implements LogStart {
  @OnInput(
    new StandardActionBuilder(Enum.KeyCode.C)
      .setID(ActionID.Crouch)
  )
  public crouch(): void {
    // code for crouching
    print("crouched")
  }

  @OnInputRelease(ActionID.Crouch)
  public stand(): void {
    // code for standing
    print("stood")
  }
}