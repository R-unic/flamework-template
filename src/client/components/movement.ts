import { Component } from "@flamework/components";
import type { OnPhysics, OnStart } from "@flamework/core";
import { UserInputService as InputService } from "@rbxts/services";

import type { LogStart } from "shared/hooks";
import { studsToMeters } from "shared/utility/3D";
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
}

@Component({
  tag: "Movement",
  defaults: {
    ["Movement_Speed"]: 1
  }
})
export class Movement extends InputInfluenced<Attributes, Model & { PrimaryPart: BasePart; }> implements OnStart, OnPhysics, LogStart {
  private readonly appliedDirections: MoveDirection[] = [];
  private spacebarDown = false;
  private canJump = true;
  private jumpCooldown = 0.35;
  private jumpForce = 50;

  public onStart(): void {
    const moveKeys = ["W", "A", "S", "D"];

    this.janitor.Add(InputService.InputBegan.Connect(({ KeyCode: key }) => {
      if (key.Name !== "Space") return;
      this.spacebarDown = true;
      this.jump();
    }));
    this.janitor.Add(InputService.InputEnded.Connect(() => this.spacebarDown = false));

    this.janitor.Add(InputService.InputBegan.Connect(({ KeyCode: key }) => {
      if (!moveKeys.includes(key.Name)) return;
      const direction = this.getDirectionFromKey(key.Name);
      this.move(direction);
    }));
    this.janitor.Add(InputService.InputEnded.Connect(({ KeyCode: key }) => {
      if (!moveKeys.includes(key.Name)) return;
      const releasedDirection = this.getDirectionFromKey(key.Name);
      const directionIndex = this.appliedDirections.indexOf(releasedDirection);
      this.appliedDirections.remove(directionIndex);
    }));
  }

  public onPhysics(dt: number): void {
    if (!this.isMoving()) return;

    const directionVector = this.getMoveVector();
    const speed = studsToMeters(this.getSpeed());
    let force = directionVector.mul(speed).mul(dt).mul(60);
    if (isNaN(force.X) || isNaN(force.Y) || isNaN(force.Z))
      force = new Vector3;

    this.instance.PrimaryPart.CFrame = this.instance.PrimaryPart.CFrame.add(force);
  }

  private jump(): void {
    if (!this.canJump) return;
    this.canJump = false;
    task.delay(this.jumpCooldown, () => {
      this.canJump = true;
      if (!this.spacebarDown) return;
      this.jump();
    });

    const yVelocity = flattenNumber(this.getVelocity().Y);
    if (yVelocity !== 0) return;
    this.addForce(new Vector3(0, this.jumpForce, 0));
  }

  private move(direction: MoveDirection): void {
    this.appliedDirections.push(direction);
  }

  private addForce(force: Vector3): void {
    this.setForce(this.getVelocity().add(force));
  }

  private setForce(force: Vector3): void {
    this.instance.PrimaryPart.AssemblyLinearVelocity = force;
  }

  private getVelocity(): Vector3 {
    return this.instance.PrimaryPart.AssemblyLinearVelocity;
  }

  private getSpeed(): number {
    return this.attributes["Movement_Speed"];
  }

  private isMoving(): boolean {
    return this.appliedDirections.size() > 0;
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

  private getMoveVector(): Vector3 {
    const rootCFrame = this.instance.PrimaryPart.CFrame;
    let vector = new Vector3;

    for (const direction of this.appliedDirections) {
      const directionVector = this.getVectorFromDirection(rootCFrame, direction);
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
        return RightVector.mul(-1);
      case MoveDirection.Right:
        return RightVector;
    }
  }
}