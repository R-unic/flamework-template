import { Component, type Components } from "@flamework/components";
import { Dependency, type OnPhysics, type OnStart } from "@flamework/core";
import { UserInputService as InputService, Workspace as World } from "@rbxts/services";
import { RaycastParamsBuilder } from "@rbxts/builders";

import type { LogStart } from "shared/hooks";
import { Events } from "client/network";
import { metersToStuds, studsToMeters } from "shared/utility/3D";
import { isNaN } from "shared/utility/numbers";
import { removeDuplicates } from "shared/utility/array";
import type { WithControlPanelSettings } from "shared/structs/control-panel";

import { InputInfluenced } from "client/base-components/input-influenced";
import Iris from "@rbxts/iris";

type KeyName = ExtractKeys<typeof Enum.KeyCode, EnumItem>;

const enum MoveDirection {
  Forwards = "Forwards",
  Backwards = "Backwards",
  Left = "Left",
  Right = "Right"
}

interface Attributes {
  Movement_Speed: number;
  Movement_Acceleration: number;
  Movement_Friction: number;
  Movement_AirFriction: number;
  Movement_CanMoveMidair: boolean;
  Movement_JumpCooldown: number;
  Movement_JumpForce: number;
  Movement_GravitationalConstant: number;
  Movement_Restrictive: boolean;
  Movement_RestrictiveMaxEdgeHeight: number;
  Movement_Rotational: boolean;
  Movement_RotationSpeed: number;
}

const NO_JUMP_STATES: Enum.HumanoidStateType[] = [
  Enum.HumanoidStateType.FallingDown,
  Enum.HumanoidStateType.Freefall,
  Enum.HumanoidStateType.Jumping,
  Enum.HumanoidStateType.Flying,
  Enum.HumanoidStateType.GettingUp,
  Enum.HumanoidStateType.Dead
];

/**
 * This works great for singleplayer!
 * Unfortunately in multiplayer movement appears laggy.
 */
@Component({
  tag: "Movement",
  defaults: {
    Movement_Speed: 1,
    Movement_Acceleration: 0.5,
    Movement_Friction: 0.175,
    Movement_AirFriction: 0.01,
    Movement_CanMoveMidair: false,
    Movement_JumpCooldown: 0.4,
    Movement_JumpForce: 6,
    Movement_GravitationalConstant: 3, // m/s, 9.81 is earth's constant
    Movement_Restrictive: false,
    Movement_RestrictiveMaxEdgeHeight: 1,
    Movement_Rotational: false,
    Movement_RotationSpeed: 1,
  }
})
export class Movement extends InputInfluenced<Attributes, Model> implements OnStart, OnPhysics, LogStart, WithControlPanelSettings {
  public friction = this.attributes.Movement_Friction;

  private readonly root = <Part>this.instance.WaitForChild("HumanoidRootPart");
  private readonly humanoid = <Humanoid>this.instance.WaitForChild("Humanoid");
  private readonly moveDirections: MoveDirection[] = [];
  private velocity = new Vector3;
  private angularVelocity = new Vector3;
  private touchingGround = false;
  private spacebarDown = false;
  private canJump = true;
  private canMove = true;

  public static start(character: Model): void {
    Events.character.toggleDefaultMovement(false);
    const components = Dependency<Components>();
    components.addComponent<Movement>(character);
  }

  public onStart(): void {
    this.disableElasticity();
    this.updateGravity();
    this.onAttributeChanged("Movement_GravitationalConstant", () => this.updateGravity());

    this.janitor.Add(Events.character.toggleCustomMovement.connect(on => this.canMove = on));

    const moveKeys: KeyName[] = ["W", "A", "S", "D", "Up", "Left", "Down", "Right"];
    this.janitor.Add(InputService.InputBegan.Connect(({ KeyCode: key }) => {
      if (key.Name !== "Space") return;
      if (!this.canMove) return;

      this.spacebarDown = true;
      this.jump();
    }));
    this.janitor.Add(InputService.InputEnded.Connect(({ KeyCode: key }) => {
      if (key.Name !== "Space") return;
      this.spacebarDown = false;
    }));

    this.janitor.Add(InputService.InputBegan.Connect(({ KeyCode: key }) => {
      if (!moveKeys.includes(key.Name)) return;
      if (!this.canMove) return;

      const direction = this.getDirectionFromKey(key.Name);
      this.applyMovementDirection(direction);
    }));
    this.janitor.Add(InputService.InputEnded.Connect(({ KeyCode: key }) => {
      if (!moveKeys.includes(key.Name)) return;

      const releasedDirection = this.getDirectionFromKey(key.Name);
      this.moveDirections.remove(this.moveDirections.indexOf(releasedDirection));
    }));
  }

  public onPhysics(dt: number): void {
    if (this.instance === undefined) return;
    if (!this.canMove) return;

    this.updateVelocity(dt);
    if (this.isRotational())
      this.updateRotational(dt);
    if (this.isRestrictive())
      this.updateRestrictive();

    const { X: turn } = this.angularVelocity;
    this.root.CFrame = this.root.CFrame
      .add(this.velocity)
      .mul(CFrame.Angles(0, turn / 1.75, 0));

    this.angularVelocity = new Vector3;
  }

  public renderControlPanelSettings(): void {
    Iris.Tree(["Movement"]);

    const speed = Iris.SliderNum(["Speed", 0.05, 0.05, 30], { number: Iris.State(this.getSpeed()) });
    if (speed.numberChanged())
      this.attributes.Movement_Speed = speed.state.number.get();

    const acceleration = Iris.SliderNum(["Acceleration", 0.01, 0, 3], { number: Iris.State(this.getAcceleration()) });
    if (acceleration.numberChanged())
      this.attributes.Movement_Acceleration = acceleration.state.number.get();

    const friction = Iris.SliderNum(["Friction", 0.01, 0, 1], { number: Iris.State(this.friction) });
    if (friction.numberChanged())
      this.attributes.Movement_Friction = friction.state.number.get();

    const airFriction = Iris.SliderNum(["Air Friction", 0.01, 0, 1], { number: Iris.State(this.getAirFriction()) });
    if (airFriction.numberChanged())
      this.attributes.Movement_AirFriction = airFriction.state.number.get();

    Iris.Separator();

    const canMoveMidair = Iris.Checkbox(["Can Move Midair?"], { isChecked: Iris.State(this.canMoveMidair()) });
    if (canMoveMidair.checked())
      this.attributes.Movement_CanMoveMidair = true;
    if (canMoveMidair.unchecked())
      this.attributes.Movement_CanMoveMidair = false;

    const jumpCooldown = Iris.SliderNum(["Jump Cooldown", 0.01, 0, 5], { number: Iris.State(this.getJumpCooldown()) });
    if (jumpCooldown.numberChanged())
      this.attributes.Movement_JumpCooldown = jumpCooldown.state.number.get();

    const jumpForce = Iris.SliderNum(["Jump Force", 1, 0, 100], { number: Iris.State(this.getJumpForce()) });
    if (jumpForce.numberChanged())
      this.attributes.Movement_JumpForce = jumpForce.state.number.get();

    const gravitationalConstant = Iris.SliderNum(["Gravitational Constant (G)", 0.025, 0.1, 20], { number: Iris.State(this.getG()) });
    if (gravitationalConstant.numberChanged())
      this.attributes.Movement_GravitationalConstant = gravitationalConstant.state.number.get();

    const restrictive = Iris.Checkbox(["Restrictive?"], { isChecked: Iris.State(this.isRestrictive()) });
    if (restrictive.checked())
      this.attributes.Movement_Restrictive = true;
    if (restrictive.unchecked())
      this.attributes.Movement_Restrictive = false;

    const maxEdgeHeight = Iris.SliderNum(["Restrictive Max Edge Height", 0.01, 0, 5], { number: Iris.State(this.getRestrictiveMaxEdgeHeight()) });
    if (maxEdgeHeight.numberChanged())
      this.attributes.Movement_RestrictiveMaxEdgeHeight = maxEdgeHeight.state.number.get();

    const rotational = Iris.Checkbox(["Rotational?"], { isChecked: Iris.State(this.isRotational()) });
    if (rotational.checked())
      this.attributes.Movement_Rotational = true;
    if (rotational.unchecked())
      this.attributes.Movement_Rotational = false;

    const rotationSpeed = Iris.SliderNum(["Rotation Speed", 0.01, 0, 5], { number: Iris.State(this.getRotationSpeed()) });
    if (rotationSpeed.numberChanged())
      this.attributes.Movement_RotationSpeed = rotationSpeed.state.number.get();

    Iris.End();
  }

  public getVelocity(): Vector3 {
    return this.velocity;
  }

  public getSpeed(): number {
    return this.attributes.Movement_Speed;
  }

  public getAcceleration(): number {
    return this.attributes.Movement_Acceleration;
  }

  public getAirFriction(): number {
    return this.attributes.Movement_AirFriction;
  }

  public canMoveMidair(): boolean {
    return this.attributes.Movement_CanMoveMidair;
  }

  public getJumpCooldown(): number {
    return this.attributes.Movement_JumpCooldown;
  }

  public getJumpForce(): number {
    return this.attributes.Movement_JumpForce;
  }

  public getG(): number {
    return this.attributes.Movement_GravitationalConstant;
  }

  public isRestrictive(): boolean {
    return this.attributes.Movement_Restrictive;
  }

  public getRestrictiveMaxEdgeHeight(): number {
    return this.attributes.Movement_RestrictiveMaxEdgeHeight;
  }

  public isRotational(): boolean {
    return this.attributes.Movement_Rotational;
  }

  public getRotationSpeed(): number {
    return this.attributes.Movement_RotationSpeed;
  }

  public isMoving(): boolean {
    return (this.isRotational() ? this.moveDirections.filter(v => !this.getAngularMovementDirections().includes(v)) : this.moveDirections).size() > 0;
  }

  private updateVelocity(dt: number): void {
    const directionVector = this.getVectorFromDirections(this.moveDirections);
    this.touchingGround = this.isTouchingGround();
    this.friction = this.touchingGround ?
      this.attributes.Movement_Friction
      : this.getAirFriction();

    const speed = studsToMeters(this.getSpeed());
    const dontApplyAirForce = !this.canMoveMidair() && !this.touchingGround;
    const desiredForce = directionVector.mul(speed);
    const dontApplyForce = dontApplyAirForce || isNaN(directionVector.X) || isNaN(desiredForce.X);
    const force = dontApplyForce ? new Vector3 : desiredForce.sub(this.velocity);
    this.velocity = this.applyFriction(this.velocity)
      .add(this.applyAcceleration(force, dt));
  }

  private updateRotational(dt: number): void {
    const dontApplyAirForce = !this.canMoveMidair() && !this.touchingGround;
    const rotationSpeed = studsToMeters(this.getRotationSpeed());
    const angularMovementDirections = this.getAngularMovementDirections();
    let angularDirection = new Vector3;
    for (const direction of angularMovementDirections)
      angularDirection = angularDirection.add(new Vector3(direction === MoveDirection.Left ? -1 : 1, 0, 0).mul(-1));

    const dontApplyAngularForce = dontApplyAirForce || isNaN(angularDirection.X);
    const desiredAngularForce = angularDirection.mul(rotationSpeed);
    const angularForce = dontApplyAngularForce ? new Vector3 : desiredAngularForce;
    this.angularVelocity = this.applyFriction(this.angularVelocity)
      .add(this.applyAcceleration(angularForce, dt));
  }

  private updateRestrictive(): void {
    const directionVector = this.getVectorFromDirections(this.moveDirections);
    const rayParams = new RaycastParamsBuilder()
      .SetIgnoreWater(true)
      .AddToFilter(this.instance)
      .Build();

    const characterSize = this.instance.GetBoundingBox()[1];
    const distanceToGround = characterSize.Y / 2;
    const distanceAhead = 1;
    const down = new Vector3(0, -1, 0);
    const forward = directionVector;
    const edgeRaySize = distanceToGround + this.getRestrictiveMaxEdgeHeight();
    const wallRaySize = 0.5;
    const position = this.root.Position.add(forward.mul(distanceAhead));
    const edgeResult = World.Raycast(position, down.mul(edgeRaySize), rayParams);
    const wallResult = World.Raycast(this.root.Position, forward.mul(wallRaySize), rayParams);
    if (edgeResult?.Instance === undefined)
      this.velocity = new Vector3;
    if (wallResult?.Instance !== undefined && wallResult.Instance.CanCollide)
      this.velocity = new Vector3;
  }

  private getAngularMovementDirections(): MoveDirection[] {
    return removeDuplicates(this.moveDirections.filter(dir => [MoveDirection.Left, MoveDirection.Right].includes(dir)));
  }

  private applyAcceleration(force: Vector3, dt: number): Vector3 {
    return force.mul(studsToMeters(this.getAcceleration() * dt * 60));
  }

  private applyFriction(velocity: Vector3): Vector3 {
    return velocity.mul(this.isMoving() ? 1 : 1 - this.friction);
  }

  private getRootVelocity(): Vector3 {
    return this.root.AssemblyLinearVelocity;
  }

  private updateGravity(): void {
    World.Gravity = this.getG() * 20;
  }

  private disableElasticity(): void {
    const characterParts = this.instance.GetDescendants()
      .filter((i): i is BasePart => i.IsA("BasePart"));

    for (const part of characterParts)
      part.CustomPhysicalProperties = new PhysicalProperties(0.7, 0.3, 0, 0, 0);
  }

  private jump(): void {
    if (!this.canJump) return;
    this.canJump = false;
    task.delay(this.getJumpCooldown(), () => {
      this.canJump = true;
      if (!this.spacebarDown) return;
      this.jump();
    });

    if (NO_JUMP_STATES.includes(this.humanoid.GetState())) return;

    this.humanoid.SetStateEnabled(Enum.HumanoidStateType.Jumping, true);
    this.addForce(new Vector3(0, metersToStuds(this.getJumpForce()), 0));
  }

  private applyMovementDirection(direction: MoveDirection): void {
    this.moveDirections.push(direction);
  }

  private addForce(force: Vector3): void {
    this.setForce(this.getRootVelocity().add(force));
  }

  private setForce(force: Vector3): void {
    this.root.AssemblyLinearVelocity = force;
  }

  private getVectorFromDirections(directions: MoveDirection[]): Vector3 {
    let vector = new Vector3;
    for (const direction of directions) {
      const directionVector = this.getVectorFromDirection(this.root.CFrame, direction);
      vector = vector.add(directionVector);
    }

    return vector.Unit;
  }

  private getVectorFromDirection(cframe: CFrame, direction: MoveDirection): Vector3 {
    const { LookVector, RightVector } = cframe;
    switch (direction) {
      case MoveDirection.Forwards:
        return LookVector;
      case MoveDirection.Backwards:
        return LookVector.mul(-1);
      case MoveDirection.Left:
        return this.isRotational() ? new Vector3 : RightVector.mul(-1);
      case MoveDirection.Right:
        return this.isRotational() ? new Vector3 : RightVector;
    }
  }

  private getDirectionFromKey(key: KeyName): MoveDirection {
    switch (key) {
      case "W":
      case "Up":
        return MoveDirection.Forwards;
      case "A":
      case "Left":
        return MoveDirection.Left;
      case "S":
      case "Down":
        return MoveDirection.Backwards;
      case "D":
      case "Right":
        return MoveDirection.Right;
    }

    return <MoveDirection><unknown>undefined;
  }

  private isTouchingGround(): boolean {
    if (this.root === undefined) return false;

    const [_, characterSize] = this.instance.GetBoundingBox();
    const distanceToGround = characterSize.Y / 2;
    const raycastParams = new RaycastParamsBuilder()
      .AddToFilter(this.instance)
      .Build();

    const result = World.Raycast(this.root.Position, this.root.CFrame.UpVector.mul(-5), raycastParams);
    return result !== undefined && (result.Distance - 0.3) <= distanceToGround;
  }
}