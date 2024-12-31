import { Controller, type OnInit, type OnRender } from "@flamework/core";
import { UserInputService as UserInput, Workspace as World } from "@rbxts/services";
import { AxisAction, AxisActionBuilder, StandardActionBuilder } from "@rbxts/mechanism";
import { RaycastParamsBuilder } from "@rbxts/builders";
import Charm, { atom } from "@rbxts/charm";
import Signal from "@rbxts/signal";

import { OnInput, OnAxisInput, OnInputRelease, inputManager } from "client/decorators";
import { Player } from "client/utility";
import { ActionID } from "./input";

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
  private readonly rightThumbstickAxis = new AxisActionBuilder("Thumbstick2");
  private readonly thumbstickDeadzone = 0.1;

  private lastInput?: Enum.UserInputType;
  private delta = new Vector2;

  public onInit(): void {
    inputManager
      .bind(this.rightThumbstickAxis)
      .bind(new StandardActionBuilder("L2").setID(ActionID.LeftTrigger))
      .bind(new StandardActionBuilder("R2").setID(ActionID.RightTrigger));

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
      case Enum.UserInputType.Gamepad1:
      case Enum.UserInputType.Gamepad2:
      case Enum.UserInputType.Gamepad3:
      case Enum.UserInputType.Gamepad4:
      case Enum.UserInputType.Gamepad5:
      case Enum.UserInputType.Gamepad6:
      case Enum.UserInputType.Gamepad7:
      case Enum.UserInputType.Gamepad8: {
        const { X, Y } = this.rightThumbstickAxis.position;
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

  /** @hidden */
  @OnAxisInput(new AxisActionBuilder("MouseWheel"))
  public onScroll(axis: AxisAction): void {
    this.scrolled.Fire(-axis.position.Z);
  }

  /** @hidden */
  @OnAxisInput(new AxisActionBuilder("R2"))
  public onR2AxisChange(axis: AxisAction): void {
    this.triggerAxesChange(axis, this.isLmbDown);
  }

  /** @hidden */
  @OnAxisInput(new AxisActionBuilder("L2"))
  public onL2AxisChange(axis: AxisAction): void {
    this.triggerAxesChange(axis, this.isLmbDown);
  }

  /** @hidden */
  @OnInputRelease(ActionID.RightTrigger)
  public onR2Release(): void {
    this.rmbUp();
  }

  /** @hidden */
  @OnInputRelease(ActionID.LeftTrigger)
  public onL2Release(): void {
    this.lmbUp();
  }

  /** @hidden */
  @OnInputRelease(ActionID.MMB)
  public mmbUp(): void {
    this.isMmbDown(false);
  }

  /** @hidden */
  @OnInput(
    new StandardActionBuilder("MouseButton3")
      .setID(ActionID.MMB)
  )
  public mmbDown(): void {
    this.isMmbDown(true);
  }

  /** @hidden */
  @OnInputRelease(ActionID.RMB)
  public rmbUp(): void {
    this.isRmbDown(false);
  }

  /** @hidden */
  @OnInput(
    new StandardActionBuilder("MouseButton2")
      .setID(ActionID.RMB)
  )
  public rmbDown(): void {
    this.isRmbDown(true);
  }

  /** @hidden */
  @OnInputRelease(ActionID.LMB)
  public lmbUp(): void {
    this.isLmbDown(false);
  }

  /** @hidden */
  @OnInput(
    new StandardActionBuilder("MouseButton1")
      .setID(ActionID.LMB)
  )
  public lmbDown(): void {
    this.isLmbDown(true);
  }

  private triggerAxesChange(axis: AxisAction, isDown: Charm.Atom<boolean>): void {
    if (axis.delta.Z < 0) return void isDown(false);
    if (axis.delta.Z < 0.05) return;
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