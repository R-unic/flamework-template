import { Controller, type OnInit, type OnRender } from "@flamework/core";
import { UserInputService as UserInput, Workspace as World } from "@rbxts/services";
import { RaycastParamsBuilder } from "@rbxts/builders";
import { Context as InputContext } from "@rbxts/gamejoy";
import { Action, Axis } from "@rbxts/gamejoy/out/Actions";
import Signal from "@rbxts/signal";

import { Player } from "shared/utility/client";
import { atom } from "@rbxts/charm";

const { abs } = math;

const MOUSE_RAY_DISTANCE = 1000;

/** Mouse controller that emulates cross-platform actions */
@Controller()
export class MouseController implements OnInit, OnRender {
  public readonly scrolled = new Signal<(delta: number) => void>;

  public isLmbDown = atom(false);
  public isRmbDown = atom(false);
  public isMmbDown = atom(false);
  public iconEnabled = atom(true);
  public behavior = atom(<Enum.MouseBehavior>Enum.MouseBehavior.Default);

  private readonly playerMouse = Player.GetMouse();
  private readonly clickAction = new Action("MouseButton1");
  private readonly rightClickAction = new Action("MouseButton2");
  private readonly L2Axis = new Axis("ButtonL2");
  private readonly R2Axis = new Axis("ButtonR2");
  private readonly RThumbstickAxis = new Axis("Thumbstick2");
  private readonly thumbstickDeadzone = 0.1;
  private readonly middleClickAction = new Action("MouseButton3");
  private readonly scrollAction = new Axis("MouseWheel");
  private readonly input = new InputContext({
    ActionGhosting: 0,
    Process: false,
    RunSynchronously: false
  });

  private lastInput?: Enum.UserInputType;
  private delta = new Vector2;

  public onInit(): void {
    const lmbDown = () => this.isLmbDown(true);
    const lmbUp = () => this.isLmbDown(false);
    const rmbDown = () => this.isRmbDown(true);
    const rmbUp = () => this.isRmbDown(false);
    const mmbDown = () => this.isMmbDown(true);
    const mmbUp = () => this.isMmbDown(false);

    this.input
      .Bind(this.clickAction, lmbDown)
      .BindEvent("onLmbRelease", this.clickAction.Released, lmbUp)
      .Bind(this.R2Axis, () => {
        if (this.R2Axis.Delta.Z < 0) return lmbUp();
        if (this.R2Axis.Delta.Z < 0.05) return;
        lmbDown();
      })
      .BindEvent("onR2Release", this.R2Axis.Released, lmbUp);

    this.input
      .Bind(this.rightClickAction, rmbDown)
      .BindEvent("onRmbRelease", this.rightClickAction.Released, rmbUp)
      .Bind(this.L2Axis, () => {
        if (this.L2Axis.Delta.Z < 0) return rmbUp();
        if (this.L2Axis.Delta.Z < 0.05) return;
        rmbDown();
      })
      .BindEvent("onL2Release", this.L2Axis.Released, rmbUp)
      .Bind(this.RThumbstickAxis, () => { /* this is only so that the Position property computes */ });

    this.input
      .Bind(this.scrollAction, () => this.scrolled.Fire(-this.scrollAction.Position.Z))
      .Bind(this.middleClickAction, mmbDown)
      .BindEvent("onMmbRelease", this.middleClickAction.Released, mmbUp);

    // Touch controls
    UserInput.TouchPinch.Connect((_, scale) => this.scrolled.Fire((scale < 1 ? 1 : -1) * abs(scale - 2)));
    UserInput.TouchStarted.Connect(lmbDown);
    UserInput.TouchEnded.Connect(lmbUp);
    UserInput.InputChanged.Connect(input => this.lastInput = input.UserInputType);
  }

  public onRender(dt: number): void {
    const behavior = this.behavior();
    if (UserInput.MouseBehavior !== behavior && behavior !== Enum.MouseBehavior.Default)
      UserInput.MouseBehavior = behavior;

    UserInput.MouseIconEnabled = this.iconEnabled();
    switch (this.lastInput) {
      case Enum.UserInputType.MouseMovement: {
        this.delta = UserInput.GetMouseDelta();
        break;
      }
      case Enum.UserInputType.Gamepad1: {
        const { X, Y } = this.RThumbstickAxis.Position;
        this.delta = new Vector2(
          this.applyThumbstickDeadzone(X),
          this.applyThumbstickDeadzone(-Y)
        ).mul(10);
        break;
      }
    }
  }

  public getScreenPosition(): Vector2 {
    return UserInput.GetMouseLocation();
  }

  public getWorldPosition(distance = MOUSE_RAY_DISTANCE): Vector3 {
    const { X, Y } = UserInput.GetMouseLocation();
    const { Origin, Direction } = World.CurrentCamera!.ViewportPointToRay(X, Y);
    const raycastResult = this.createRay(distance);
    return raycastResult !== undefined ? raycastResult.Position : Origin.add(Direction.mul(distance));
  }

  public target(distance = MOUSE_RAY_DISTANCE): Maybe<BasePart> {
    return this.createRay(distance)?.Instance;
  }

  public getDelta(): Vector2 {
    return this.delta;
  }

  public setTargetFilter(filterInstance: Instance): void {
    this.playerMouse.TargetFilter = filterInstance;
  }

  public setIcon(icon: string): void {
    UserInput.MouseIcon = icon;
  }

  private applyThumbstickDeadzone(coord: number): number {
    if (abs(coord) < this.thumbstickDeadzone) return 0;
    return (coord > 0 ? coord - this.thumbstickDeadzone : coord + this.thumbstickDeadzone) / (1 - this.thumbstickDeadzone);
  }

  private createRay(distance: number, filter: Instance[] = []): Maybe<RaycastResult> {
    const { X, Y } = UserInput.GetMouseLocation();
    const { Origin, Direction } = World.CurrentCamera!.ViewportPointToRay(X, Y);

    const raycastParams = new RaycastParamsBuilder()
      .SetIgnoreWater(true)
      .AddToFilter(...filter)
      .Build();

    return World.Raycast(Origin, Direction.mul(distance), raycastParams);
  }
}