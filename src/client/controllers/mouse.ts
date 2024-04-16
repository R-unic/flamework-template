import { Controller, OnInit } from "@flamework/core";
import { UserInputService as UIS, Workspace as World } from "@rbxts/services";
import { RaycastParamsBuilder } from "@rbxts/builders";
import { Context as InputContext } from "@rbxts/gamejoy";
import { Action, Axis, Union } from "@rbxts/gamejoy/out/Actions";

import { Player } from "shared/utility/client";
import Signal from "@rbxts/signal";

const { abs } = math;

const MOUSE_RAY_DISTANCE = 1000;

export const enum MouseIcon {
  Default,
  Drag,
}

@Controller()
export class MouseController implements OnInit {
  public readonly lmbUp = new Signal<() => void>;
  public readonly rmbUp = new Signal<() => void>;
  public readonly mmbUp = new Signal<() => void>;
  public readonly lmbDown = new Signal<() => void>;
  public readonly rmbDown = new Signal<() => void>;
  public readonly mmbDown = new Signal<() => void>;
  public readonly scrolled = new Signal<(delta: number) => void>;
  public isLmbDown = false;
  public isRmbDown = false;
  public isMmbDown = false;

  private readonly playerMouse = Player.GetMouse();
  private readonly clickAction = new Union(["MouseButton1", "Touch"]);
  private readonly rightClickAction = new Action("MouseButton2");
  private readonly middleClickAction = new Action("MouseButton3");
  private readonly scrollAction = new Axis("MouseWheel");
  private readonly input = new InputContext({
    ActionGhosting: 0,
    Process: false,
    RunSynchronously: false
  });

  public onInit(): void {
    // Mouse controls
    this.input
      .Bind(this.clickAction, () => {
        this.isLmbDown = true;
        this.lmbDown.Fire();
      })
      .BindEvent("onLmbRelease", this.clickAction.Released, () => {
        this.isLmbDown = false
      });

    this.input
      .Bind(this.rightClickAction, () => {
        this.isRmbDown = true;
        this.rmbDown.Fire();
      })
      .BindEvent("onRmbRelease", this.rightClickAction.Released, () => {
        this.isRmbDown = false
      });

    this.input
      .Bind(this.scrollAction, () => this.scrolled.Fire(-this.scrollAction.Position.Z))
      .Bind(this.middleClickAction, () => {
        this.isMmbDown = true;
        this.mmbDown.Fire();
      })
      .BindEvent("onMmbRelease", this.middleClickAction.Released, () => {
        this.isMmbDown = false
      });

    // Touch controls
    UIS.TouchPinch.Connect((_, scale) => this.scrolled.Fire((scale < 1 ? 1 : -1) * abs(scale - 2)));
    UIS.TouchStarted.Connect(() => this.isLmbDown = true);
    UIS.TouchEnded.Connect(() => this.isLmbDown = false);
  }

  public getWorldPosition(distance = MOUSE_RAY_DISTANCE): Vector3 {
    const { X, Y } = UIS.GetMouseLocation();
    const { Origin, Direction } = World.CurrentCamera!.ViewportPointToRay(X, Y);
    const raycastResult = this.createRay(distance);
    if (raycastResult)
      return raycastResult.Position;
    else
      return Origin.add(Direction.mul(distance));
  }

  public target(distance = MOUSE_RAY_DISTANCE): Maybe<BasePart> {
    return this.createRay(distance)?.Instance;
  }

  public delta(): Vector2 {
    return UIS.GetMouseDelta();
  }

  public setTargetFilter(filterInstance: Instance) {
    this.playerMouse.TargetFilter = filterInstance;
  }

  public setBehavior(behavior: Enum.MouseBehavior) {
    UIS.MouseBehavior = behavior;
  }

  public setIcon(icon: string): void {
    UIS.MouseIcon = icon;
  }

  private createRay(distance: number, filter: Instance[] = []): Maybe<RaycastResult> {
    const { X, Y } = UIS.GetMouseLocation();
    const { Origin, Direction } = World.CurrentCamera!.ViewportPointToRay(X, Y);

    const raycastParams = new RaycastParamsBuilder()
      .SetIgnoreWater(true)
      .AddToFilter(...filter)
      .Build();

    return World.Raycast(Origin, Direction.mul(distance), raycastParams);
  }
}