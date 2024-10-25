import { Controller } from "@flamework/core";

import { OnInput, OnInputRelease } from "client/decorators";

/** Handles all game input */
@Controller()
export class InputController {
  @OnInput("C", "crouch")
  public crouch(): void {
    // code for crouching
    print("crouched")
  }

  @OnInputRelease("crouch")
  public stand(): void {
    // code for standing
    print("stood")
  }
}