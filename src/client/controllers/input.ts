import { Controller, type OnInit } from "@flamework/core";

import { InputInfluenced } from "client/classes/input-influenced";

@Controller()
export class InputController extends InputInfluenced implements OnInit {
  public onInit(): void {
    // put all input bindings for your game here
    this.input.Bind("F", () => print("interact"));
  }
}