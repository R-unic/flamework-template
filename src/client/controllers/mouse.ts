import { Controller, type OnInit, type OnRender } from "@flamework/core";
import { UserInputService as UserInput, Workspace as World } from "@rbxts/services";
import { RaycastParamsBuilder } from "@rbxts/builders";
import { Context as InputContext } from "@rbxts/gamejoy";
import { Axis } from "@rbxts/gamejoy/out/Actions";
import Charm, { atom } from "@rbxts/charm";
import Signal from "@rbxts/signal";

import { OnInput, OnAxisInput, OnInputRelease } from "client/decorators";
import { Player } from "client/utility";

const { abs } = math;

const MOUSE_RAY_DISTANCE = 1000;

/** Mouse controller that emulates cross-platform actions */
@Controller({ loadOrder: 0 })
export class MouseController implements OnInit, OnRender {
  public readonly scrolled = new Signal<(delta: number) => void>;
  public readonly isLmbDown = atom(false);
  public readonly isRmbDown = atom(false);
  public readonly isMmbDown = atom(false);
  public readonly iconEnabled = atom(true);
  public readonly behavior = atom<Enum.MouseBehavior>(Enum.MouseBehavior.Default);

  private readonly playerMouse = Player.GetMouse();
  private readonly rightThumbstickAxis = new Axis("Thumbstick2");
  private readonly thumbstickDeadzone = 0.1;

  private lastInput?: Enum.UserInputType;
  private delta = new Vector2;

  public onInit(): void {
    new InputContext().Bind(this.rightThumbstickAxis, () => { /* this is only so that the Position property computes */ });

    // Touch controls
    UserInput.TouchPinch.Connect((_, scale) => this.scrolled.Fire((scale < 1 ? 1 : -1) * abs(scale - 2)));
    UserInput.TouchStarted.Connect(() => this.lmbDown());
    UserInput.TouchEnded.Connect(() => this.lmbUp());
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
        const { X, Y } = this.rightThumbstickAxis.Position;
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

  @OnAxisInput("MouseWheel")
  private onScroll(axis: Axis<"MouseWheel">): void {
    this.scrolled.Fire(-axis.Position.Z);
  }

  @OnAxisInput("ButtonR2", "axisR2")
  private onR2AxisChange(axis: Axis<"ButtonR2">): void {
    this.triggerAxesChange(axis, this.isLmbDown);
  }

  @OnAxisInput("ButtonL2", "axisL2")
  private onL2AxisChange(axis: Axis<"ButtonL2">): void {
    this.triggerAxesChange(axis, this.isLmbDown);
  }

  @OnInputRelease("axisR2")
  private onR2Release(): void {
    this.rmbUp();
  }

  @OnInputRelease("axisL2")
  private onL2Release(): void {
    this.lmbUp();
  }

  @OnInputRelease("mmb")
  private mmbUp(): void {
    return this.isMmbDown(false);
  }

  @OnInput("MouseButton3", "mmb")
  private mmbDown(): void {
    return this.isMmbDown(true);
  }

  @OnInputRelease("rmb")
  private rmbUp(): void {
    return this.isRmbDown(false);
  }

  @OnInput("MouseButton2", "rmb")
  private rmbDown(): void {
    return this.isRmbDown(true);
  }

  @OnInputRelease("lmb")
  private lmbUp(): void {
    return this.isLmbDown(false);
  }

  @OnInput("MouseButton1", "lmb")
  private lmbDown(): void {
    return this.isLmbDown(true);
  }

  private triggerAxesChange(axis: Axis<"ButtonL2" | "ButtonR2">, isDown: Charm.Atom<boolean>): void {
    if (axis.Delta.Z < 0) return isDown(false);
    if (axis.Delta.Z < 0.05) return;
    isDown(true);
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