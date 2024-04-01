import { Controller, type OnStart } from "@flamework/core";
import { Events } from "client/network";
import type { OnDataUpdate } from "shared/hooks";

@Controller()
export class InitializationController implements OnStart, OnDataUpdate {
  public onStart(): void {
    Events.data.initialize();
  }

  public onDataUpdate(directory: string, value: unknown): void {
    print(directory, value);
  }
}