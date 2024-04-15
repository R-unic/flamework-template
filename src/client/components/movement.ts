import { Component } from "@flamework/components";
import type { OnPhysics, OnStart } from "@flamework/core";
import { UserInputService as InputService } from "@rbxts/services";

import type { LogStart } from "shared/hooks";
import { STUDS_TO_METERS_CONSTANT, studsToMeters } from "shared/utility/3D";
import { InputInfluenced } from "client/base-components/input-influenced";
import { flattenNumber, isNaN } from "shared/utility/numbers";

const enum MoveDirection {
  Forwards = "Forwards",
  Backwards = "Backwards",
  Left = "Left",
  Right = "Right"
}

interface Attributes {
  ["Movement_Speed"]: number;
  ["Movement_Acceleration"]: number;
  ["Movement_Friction"]: number;
  ["Movement_JumpCooldown"]: number;
  ["Movement_JumpForce"]: number;
}

@Component({
  tag: "Movement",
  defaults: {
    ["Movement_Speed"]: 1,
    ["Movement_Acceleration"]: 1,
    ["Movement_Friction"]: 0.2,
    ["Movement_JumpCooldown"]: 0.25,
    ["Movement_JumpForce"]: 15
  }
})
export class Movement extends InputInfluenced<Attributes, Model & { PrimaryPart: BasePart; }> implements OnStart, OnPhysics, LogStart {
  private readonly root = this.instance.PrimaryPart;
  private readonly moveDirections: MoveDirection[] = [];
  private velocity = new Vector3;
  private spacebarDown = false;
  private canJump = true;

  public onStart(): void {
    const moveKeys = ["W", "A", "S", "D"];

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
    const force = isNaN(directionVector.X) ? new Vector3 : directionVector.mul(studsToMeters(this.getAcceleration())).mul(dt).mul(60);
    this.velocity = this.velocity
      .mul(this.isMoving() ? 1 : 1 - this.getFriction())
      .add(force);

    const speed = studsToMeters(this.getSpeed());
    if (this.velocity.Magnitude > speed)
      this.velocity = this.velocity.Unit.mul(speed);

    this.root.CFrame = this.root.CFrame.add(this.velocity);
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

  private getVelocity(): Vector3 {
    return this.root.AssemblyLinearVelocity;
  }

  private getSpeed(): number {
    return this.attributes["Movement_Speed"];
  }

  private getAcceleration(): number {
    return this.attributes["Movement_Acceleration"];
  }

  private getFriction(): number {
    return this.attributes["Movement_Friction"];
  }

  private getJumpCooldown(): number {
    return this.attributes["Movement_JumpCooldown"];
  }

  private getJumpForce(): number {
    return this.attributes["Movement_JumpForce"];
  }

  private isMoving(): boolean {
    return this.moveDirections.size() > 0;
  }

  private getVectorFromDirections(directions: MoveDirection[]): Vector3 {
    let vector = new Vector3;
    for (const direction of directions) {
      const directionVector = this.getVectorFromDirection(this.root.CFrame, direction);
      vector = vector.add(directionVector);
    }

    return vector.Unit;
  }

  private getDirectionFromKey(key: string): MoveDirection {
    switch (key) {
      case "W":
        return MoveDirection.Forwards;
      case "A":
        return MoveDirection.Left;
      case "S":
        return MoveDirection.Backwards;
      case "D":
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
}