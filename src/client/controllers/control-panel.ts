import { Controller, type OnStart } from "@flamework/core";
import type { Widget } from "@rbxts/iris/out/IrisDeclaration";
import type { WindowCreation } from "@rbxts/iris/out/widgetsTypes/Window";
import Iris from "@rbxts/iris";

import { OnInput } from "client/decorators";
import { Player } from "client/utility";
import { isDeveloper } from "shared/constants";
import { createMappingDecorator, processDependency } from "shared/utility/meta";
import type { ControlPanelDropdownRenderer } from "shared/structs/control-panel";

import type { MouseController } from "./mouse";

const [renderableMeta, ControlPanelRenderable] = createMappingDecorator<ControlPanelDropdownRenderer, [dropdownName: string, order?: number]>();
export { ControlPanelRenderable };

interface Renderable {
  readonly renderer: ControlPanelDropdownRenderer;
  readonly dropdownName: string;
  readonly order?: number;
}

@Controller({ loadOrder: 1 })
export class ControlPanelController implements OnStart {
  private window!: Widget<WindowCreation>;
  private mouseUnlocked = false;

  public constructor(
    private readonly mouse: MouseController
  ) { }

  public async onStart(): Promise<void> {
    const windowSize = new Vector2(300, 400);
    const renderables: Renderable[] = [];

    for (const [_, [ctor, [dropdownName, order]]] of renderableMeta)
      processDependency(ctor, renderable => renderables.push({ renderer: renderable, dropdownName, order }))

    renderables.sort((a, b) => (a.order ?? math.huge + 1) < (b.order ?? math.huge + 1));

    Iris.Init();
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.colorDark);
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.sizeClear);
    Iris.Connect(() => {
      this.window = Iris.Window(["Control Panel"], {
        size: Iris.State(windowSize),
        isOpened: Iris.State(false)
      });
      for (const renderable of renderables) {
        Iris.Tree([renderable.dropdownName]);
        renderable.renderer.renderControlPanelDropdown();
        Iris.End();
      }
      Iris.End();
    });
  }

  @OnInput("Comma")
  public open(): void {
    if (!isDeveloper(Player)) return;
    this.window.state.isOpened.set(!this.window.state.isOpened.get());
  }

  @OnInput("P")
  public unlockMouse(): void {
    if (!isDeveloper(Player)) return;
    this.mouseUnlocked = !this.mouseUnlocked;
    this.mouse.iconEnabled(this.mouseUnlocked);
    this.mouse.behavior(this.mouseUnlocked ? Enum.MouseBehavior.Default : Enum.MouseBehavior.LockCenter);
    Player.CameraMode = this.mouseUnlocked ? Enum.CameraMode.Classic : Enum.CameraMode.LockFirstPerson;
  }
}