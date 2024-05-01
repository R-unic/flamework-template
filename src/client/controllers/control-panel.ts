import { Components } from "@flamework/components";
import { Controller, type OnStart } from "@flamework/core";
import { Context as InputContext } from "@rbxts/gamejoy";
import { RunService as Runtime } from "@rbxts/services";
import Object from "@rbxts/object-utils";
import Iris from "@rbxts/iris";

import { Player } from "shared/utility/client";
import { DEVELOPERS } from "shared/constants";
import type { ProcedurallyAnimatedCamera } from "client/components/cameras/procedurally-animated";
import type Spring from "shared/classes/spring";
import type Wave from "shared/classes/wave";

import type { Movement } from "client/components/movement";
import type { CameraController } from "./camera";
import type { MouseController } from "./mouse";
import type { CharacterController } from "./character";

@Controller()
export class ControlPanelController implements OnStart {
  private readonly input = new InputContext({
    ActionGhosting: 0,
    Process: false,
    RunSynchronously: true
  });

  public constructor(
    private readonly components: Components,
    private readonly camera: CameraController,
    private readonly mouse: MouseController,
    private readonly character: CharacterController
  ) { }

  public async onStart(): Promise<void> {
    const windowSize = new Vector2(300, 400);
    const movement = await this.components.waitForComponent<Movement>(this.character.mustGet());
    let open = false;

    this.input
      .Bind("RightShift", () => {
        if (!Runtime.IsStudio() && !DEVELOPERS.includes(Player.UserId)) return;
        open = !open;
      })
      .Bind("P", () => {
        if (!Runtime.IsStudio() && !DEVELOPERS.includes(Player.UserId)) return;
        this.mouse.behavior = this.mouse.behavior === Enum.MouseBehavior.Default ? Enum.MouseBehavior.LockCenter : Enum.MouseBehavior.Default;
        Player.CameraMode = Player.CameraMode === Enum.CameraMode.LockFirstPerson ? Enum.CameraMode.Classic : Enum.CameraMode.LockFirstPerson;
      });

    Iris.Init();
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.colorDark);
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.sizeClear);

    Iris.Connect(() => {
      if (!open) return;
      Iris.Window(["Control Panel"], { size: Iris.State(windowSize) });

      this.renderCameraTab();
      this.renderProceduralAnimationsTab();
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

  private renderProceduralAnimationsTab() {
    Iris.Tree(["Procedural Animations"]);
    {
      Iris.Tree(["ProcedurallyAnimatedCamera"]);
      {
        const camera = this.camera.get<ProcedurallyAnimatedCamera>("ProcedurallyAnimated");
        Iris.Tree(["Breathing"]);
        {
          const animation = camera.animator.animations.breathing;
          const damping = Iris.SliderNum(["Damping", 0.1, 0.1, 10], { number: Iris.State(animation.damping) });
          if (damping.numberChanged())
            animation.damping = damping.state.number.get();

          this.renderWaveSettings(animation.wave)
        }
        Iris.End();
        Iris.Tree(["Landing"]);
        {
          const animation = camera.animator.animations.landing;
          const damping = Iris.SliderNum(["Damping", 0.1, 0.1, 10], { number: Iris.State(animation.damping) });
          if (damping.numberChanged())
            animation.damping = damping.state.number.get();

          this.renderSpringSettings(animation.spring);
        }
        Iris.End();
        Iris.Tree(["Mouse Sway"]);
        {
          const animation = camera.animator.animations.mouseSway;
          const damping = Iris.SliderNum(["Damping", 0.1, 0.1, 10], { number: Iris.State(animation.damping) });
          if (damping.numberChanged())
            animation.damping = damping.state.number.get();

          this.renderSpringSettings(animation.spring);
        }
        Iris.End();
        Iris.Tree(["Walk Cycle"]);
        {
          const animation = camera.animator.animations.walkCycle;
          const minimumSpeed = Iris.SliderNum(["Minimum Walk Speed", 0.5, 0, 30], { number: Iris.State(animation.minimumSpeed) });
          if (minimumSpeed.numberChanged())
            animation.minimumSpeed = minimumSpeed.state.number.get();

          this.renderSpringSettings(animation.spring);
          this.renderWaveSettings(animation.sineWave);
          this.renderWaveSettings(animation.cosineWave, "Cosine");
        }
        Iris.End();
      }
      Iris.End();
    }
    Iris.End()
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

  private renderSpringSettings(spring: Spring, prefix?: string): void {
    Iris.Tree([(prefix !== undefined ? prefix + " " : "") + "Spring"]);
    {
      const mass = Iris.SliderNum(["Spring Mass", 0.25, 0.25, 100], { number: Iris.State(spring.mass) });
      if (mass.numberChanged())
        spring.mass = mass.state.number.get();

      const force = Iris.SliderNum(["Spring Force", 0.25, 0.25, 100], { number: Iris.State(spring.force) });
      if (force.numberChanged())
        spring.force = force.state.number.get();

      const damping = Iris.SliderNum(["Spring Damping", 0.25, 0.25, 100], { number: Iris.State(spring.damping) });
      if (damping.numberChanged())
        spring.damping = damping.state.number.get();

      const speed = Iris.SliderNum(["Spring Speed", 0.25, 0.25, 100], { number: Iris.State(spring.speed) });
      if (mass.numberChanged())
        spring.speed = speed.state.number.get();
    }
    Iris.End();
  }

  private renderWaveSettings(wave: Wave, prefix?: string): void {
    Iris.Tree([(prefix ?? "Sine") + " " + "Wave"]);
    {
      const useSin = Iris.Checkbox(["Is Sine Wave?"], { isChecked: Iris.State(wave.waveFunction === math.sin) });
      if (useSin.checked())
        wave.waveFunction = math.sin;
      if (useSin.unchecked())
        wave.waveFunction = math.cos;

      const amplitude = Iris.SliderNum(["Amplitude", 0.05, 0.1, 10], { number: Iris.State(wave.amplitude) });
      if (amplitude.numberChanged())
        wave.amplitude = amplitude.state.number.get();

      const frequency = Iris.SliderNum(["Frequency", 0.05, 0, 10], { number: Iris.State(wave.frequency) });
      if (frequency.numberChanged())
        wave.frequency = frequency.state.number.get();

      const phaseShift = Iris.SliderNum(["Phase Shift", 0.01, 0, 5], { number: Iris.State(wave.phaseShift) });
      if (phaseShift.numberChanged())
        wave.phaseShift = phaseShift.state.number.get();

      const verticalShift = Iris.SliderNum(["Vertical Shift", 0.01, 0, 5], { number: Iris.State(wave.verticalShift) });
      if (verticalShift.numberChanged())
        wave.verticalShift = verticalShift.state.number.get();
    }
    Iris.End();
  }
}