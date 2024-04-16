import { Components } from "@flamework/components";
import { Controller, type OnStart } from "@flamework/core";
import { Context as InputContext } from "@rbxts/gamejoy";
import { RunService as Runtime } from "@rbxts/services";
import Iris from "@rbxts/iris";

import { Character, Player } from "shared/utility/client";
import { DEVELOPERS } from "shared/constants";

import type { CameraController } from "./camera";
import type { Movement } from "client/components/movement";
import Object from "@rbxts/object-utils";

@Controller()
export class ControlPanelController implements OnStart {
  private readonly input = new InputContext({
    ActionGhosting: 0,
    Process: false,
    RunSynchronously: true
  });

  public constructor(
    private readonly components: Components,
    private readonly camera: CameraController
  ) { }

  public async onStart(): Promise<void> {
    const windowSize = new Vector2(300, 400);
    const movement = await this.components.waitForComponent<Movement>(Character);
    let open = false;

    this.input.Bind("RightShift", () => {
      if (!Runtime.IsStudio() && !DEVELOPERS.includes(Player.UserId)) return;
      open = !open;
    });

    Iris.Init();
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.colorDark);
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.sizeClear);

    Iris.Connect(() => {
      if (!open) return;
      Iris.Window(["Control Panel"], { size: Iris.State(windowSize) });

      this.renderCameraTab();
      this.renderMovementTab(movement);

      Iris.End();
    });
  }

  private renderCameraTab(): void {
    Iris.Tree(["Camera"]);

    const currentCamera = this.camera.get().instance;
    const fov = Iris.SliderNum(["FOV", 0.25, 1, 120], { number: Iris.State(currentCamera.FieldOfView) });
    if (fov.numberChanged())
      currentCamera.FieldOfView = fov.state.number.get();

    const cameraComponents = Object.keys(this.camera.cameras).sort();
    const componentIndex = Iris.State<keyof typeof this.camera.cameras>(this.camera.currentName);
    Iris.Combo(["Camera Component"], { index: componentIndex });
    for (const component of cameraComponents)
      Iris.Selectable([component, component], { index: componentIndex });
    Iris.End();

    if (this.camera.currentName !== componentIndex.get())
      this.camera.set(componentIndex.get());

    Iris.End();
  }

  private renderMovementTab(movement?: Movement): void {
    if (movement === undefined) return;
    Iris.Tree(["Movement"]);

    const speed = Iris.SliderNum(["Speed", 0.05, 0.05, 30], { number: Iris.State(movement.getSpeed()) });
    if (speed.numberChanged())
      movement.attributes.Movement_Speed = speed.state.number.get();

    const acceleration = Iris.SliderNum(["Acceleration", 0.01, 0, 3], { number: Iris.State(movement.getAcceleration()) });
    if (acceleration.numberChanged())
      movement.attributes.Movement_Acceleration = acceleration.state.number.get();

    const friction = Iris.SliderNum(["Friction", 0.01, 0, 1], { number: Iris.State(movement.friction) });
    if (friction.numberChanged())
      movement.attributes.Movement_Friction = friction.state.number.get();

    const airFriction = Iris.SliderNum(["Air Friction", 0.01, 0, 1], { number: Iris.State(movement.getAirFriction()) });
    if (airFriction.numberChanged())
      movement.attributes.Movement_AirFriction = airFriction.state.number.get();

    Iris.Separator();

    const canMoveMidair = Iris.Checkbox(["Can Move Midair?"], { isChecked: Iris.State(movement.canMoveMidair()) });
    if (canMoveMidair.checked())
      movement.attributes.Movement_CanMoveMidair = true;
    if (canMoveMidair.unchecked())
      movement.attributes.Movement_CanMoveMidair = false;

    const jumpCooldown = Iris.SliderNum(["Jump Cooldown", 0.01, 0, 5], { number: Iris.State(movement.getJumpCooldown()) });
    if (jumpCooldown.numberChanged())
      movement.attributes.Movement_JumpCooldown = jumpCooldown.state.number.get();

    const jumpForce = Iris.SliderNum(["Jump Force", 0.25, 0, 30], { number: Iris.State(movement.getJumpForce()) });
    if (jumpForce.numberChanged())
      movement.attributes.Movement_JumpForce = jumpForce.state.number.get();

    const gravitationalConstant = Iris.SliderNum(["Gravitational Constant (G)", 0.025, 0.1, 20], { number: Iris.State(movement.getG()) });
    if (gravitationalConstant.numberChanged())
      movement.attributes.Movement_GravitationalConstant = gravitationalConstant.state.number.get();

    Iris.End();
  }
}