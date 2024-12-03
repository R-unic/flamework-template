import { Controller, type OnStart } from "@flamework/core";
import { processDependency } from "@rbxts/flamework-meta-utils";
import Iris from "@rbxts/iris";

import type { LogStart } from "shared/hooks";
import { OnInput } from "client/decorators";
import { Player } from "client/utility";
import { isDeveloper } from "shared/constants";
import { createMappingDecorator } from "shared/utility/meta";
import type { ControlPanelDropdownRenderer } from "shared/structs/control-panel";

import type { MouseController } from "./mouse";

const [renderableMeta, ControlPanelRenderable] = createMappingDecorator<ControlPanelDropdownRenderer, never[], [dropdownName: string, order?: number]>();
export { ControlPanelRenderable };

interface Renderable {
  readonly renderer: ControlPanelDropdownRenderer;
  readonly dropdownName: string;
  readonly order?: number;
}

@Controller()
export class ControlPanelController implements OnStart, LogStart {
  private readonly windowSize = new Vector2(300, 400);
  private readonly windowOpened = Iris.State(false);
  private renderables: Renderable[] = [];
  private mouseUnlocked = false;

  public constructor(
    private readonly mouse: MouseController
  ) { }

  public async onStart(): Promise<void> {
    for (const [_, [ctor, [dropdownName, order]]] of renderableMeta)
      processDependency(ctor, renderable => this.renderables.push({ renderer: renderable, dropdownName, order }));

    this.renderables.sort((a, b) => (a.order ?? math.huge + 1) < (b.order ?? math.huge + 1));

    Iris.Init();
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.colorDark);
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.sizeClear);
    Iris.Connect(() => this.render());
  }

  @OnInput("Comma")
  public open(): void {
    if (!isDeveloper(Player)) return;
    this.windowOpened.set(!this.windowOpened.get());
  }

  @OnInput("P")
  public unlockMouse(): void {
    if (!isDeveloper(Player)) return;
    this.mouseUnlocked = !this.mouseUnlocked;
    this.mouse.iconEnabled(this.mouseUnlocked);
    this.mouse.behavior(this.mouseUnlocked ? Enum.MouseBehavior.Default : Enum.MouseBehavior.LockCenter);
    Player.CameraMode = this.mouseUnlocked ? Enum.CameraMode.Classic : Enum.CameraMode.LockFirstPerson;
  }

  private render(): void {
    Iris.Window(["Control Panel"], {
      size: Iris.State(this.windowSize),
      isOpened: this.windowOpened
    });
    for (const renderable of this.renderables) {
      Iris.Tree([renderable.dropdownName]);
      renderable.renderer.renderControlPanelDropdown();
      Iris.End();
    }
    Iris.End();
  }
}