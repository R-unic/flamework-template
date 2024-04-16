import { Component, type Components } from "@flamework/components";
import { Dependency, type OnPhysics, type OnStart } from "@flamework/core";
import { UserInputService as InputService, Workspace as World } from "@rbxts/services";

import type { LogStart } from "shared/hooks";
import { STUDS_TO_METERS_CONSTANT, studsToMeters } from "shared/utility/3D";
import { InputInfluenced } from "client/base-components/input-influenced";
import { flattenNumber, isNaN } from "shared/utility/numbers";
import { Character } from "shared/utility/client";
import { Events } from "client/network";
import { RaycastParamsBuilder } from "@rbxts/builders";

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
}

@Component({
  tag: "Movement",
  defaults: {
    Movement_Speed: 1,
    Movement_Acceleration: 0.5,
    Movement_Friction: 0.175,
    Movement_AirFriction: 0.01,
    Movement_CanMoveMidair: true,
    Movement_JumpCooldown: 0.25,
    Movement_JumpForce: 6,
    Movement_GravitationalConstant: 3 // m/s, 9.81 is earth's constant
  }
})
export class Movement extends InputInfluenced<Attributes, Model & { PrimaryPart: BasePart; }> implements OnStart, OnPhysics, LogStart {
  public friction = this.attributes.Movement_Friction;

  private readonly root = this.instance.PrimaryPart;
  private readonly moveDirections: MoveDirection[] = [];
  private velocity = new Vector3;
  private touchingGround = false;
  private spacebarDown = false;
  private canJump = true;

  public static start() {
    Events.character.toggleDefaultMovement(false);
    const components = Dependency<Components>();
    components.addComponent<Movement>(Character);
  }

  public onStart(): void {
    this.disableElasticity();
    this.updateGravity();
    this.onAttributeChanged("Movement_GravitationalConstant", () => this.updateGravity());

    const moveKeys: KeyName[] = ["W", "A", "S", "D", "Up", "Left", "Down", "Right"];
    this.janitor.Add(InputService.InputBegan.Connect(({ KeyCode: key }) => {
      if (key.Name !== "Space") return;
      this.spacebarDown = true;
      this.jump();
    }));
    this.janitor.Add(InputService.InputEnded.Connect(({ KeyCode: key }) => {
      if (key.Name !== "Space") return;
      this.spacebarDown = false;
    }));

    this.janitor.Add(InputService.InputBegan.Connect(({ KeyCode: key }) => {
      if (!moveKeys.includes(key.Name)) return;

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
    const directionVector = this.getVectorFromDirections(this.moveDirections);
    this.touchingGround = this.isTouchingGround();
    this.friction = this.touchingGround ?
      this.attributes.Movement_Friction
      : this.getAirFriction();

    const dontApplyForce = (!this.canMoveMidair() && !this.touchingGround) || isNaN(directionVector.X);
    const force = dontApplyForce ? new Vector3 : directionVector.mul(studsToMeters(this.getAcceleration())).mul(dt).mul(60);
    this.velocity = this.velocity
      .mul(this.isMoving() ? 1 : 1 - this.friction)
      .add(force);

    const speed = studsToMeters(this.getSpeed());
    if (this.velocity.Magnitude > speed)
      this.velocity = this.velocity.Unit.mul(speed);

    this.root.CFrame = this.root.CFrame.add(this.velocity);
  }

  public getVelocity(): Vector3 {
    return this.root.AssemblyLinearVelocity;
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

  public isMoving(): boolean {
    return this.moveDirections.size() > 0;
  }

  private updateGravity(): void {
    World.Gravity = this.getG() * 20;
  }

  private disableElasticity(): void {
    const characterParts = this.instance.GetDescendants()
      .filter((i): i is BasePart => i.IsA("BasePart"));

    for (const part of characterParts)
      part.CustomPhysicalProperties = new PhysicalProperties(0.7, 0.3, 1, 0, 0);
  }

  private jump(): void {
    if (!this.canJump) return;
    this.canJump = false;
    task.delay(this.getJumpCooldown(), () => {
      this.canJump = true;
      if (!this.spacebarDown) return;
      this.jump();
    });

    const yVelocity = flattenNumber(this.getVelocity().Y);
    if (yVelocity !== 0) return;

    this.addForce(new Vector3(0, this.getJumpForce() * STUDS_TO_METERS_CONSTANT, 0));
  }

  private applyMovementDirection(direction: MoveDirection): void {
    this.moveDirections.push(direction);
  }

  private addForce(force: Vector3): void {
    this.setForce(this.getVelocity().add(force));
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

  private getVectorFromDirection(cframe: CFrame, direction: MoveDirection): Vector3 {
    const { LookVector, RightVector } = cframe;
    switch (direction) {
      case MoveDirection.Forwards:
        return LookVector;
      case MoveDirection.Backwards:
        return LookVector.mul(-1);
      case MoveDirection.Left:
        return RightVector.mul(-1);
      case MoveDirection.Right:
        return RightVector;
    }
  }

  private isTouchingGround(): boolean {
    const [_, characterSize] = Character.GetBoundingBox();
    const distanceToGround = characterSize.Y / 2;
    const root = Character.PrimaryPart!;
    const raycastParams = new RaycastParamsBuilder()
      .AddToFilter(Character)
      .Build();

    const result = World.Raycast(root.Position, root.CFrame.UpVector.mul(-5), raycastParams);
    return result !== undefined && (result.Distance - 0.3) <= distanceToGround;
  }
}