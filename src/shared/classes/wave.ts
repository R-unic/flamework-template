import Iris from "@rbxts/iris";

import type { WithControlPanelSettings } from "shared/structs/control-panel";

const { sin } = math;

export default class Wave implements WithControlPanelSettings {
  public constructor(
    public amplitude: number = 1,
    public frequency: number = 1,
    public phaseShift: number = 0,
    public verticalShift: number = 0,
    public waveFunction = sin
  ) { }

  public update(dt: number, damping = 1, customPhaseShift?: number): number {
    const phaseShift = customPhaseShift !== undefined ? customPhaseShift : this.phaseShift;
    return ((this.amplitude * this.waveFunction(this.frequency * os.clock() + phaseShift) + this.verticalShift) * dt) / damping;
  }

  public renderControlPanelSettings(prefix?: string): void {
    Iris.SeparatorText([(prefix !== undefined ? prefix + " " : "") + "Wave"]);

    const useSin = Iris.Checkbox(["Is Sine Wave?"], { isChecked: Iris.State(this.waveFunction === math.sin) });
    if (useSin.checked())
      this.waveFunction = math.sin;
    if (useSin.unchecked())
      this.waveFunction = math.cos;

    const amplitude = Iris.SliderNum(["Amplitude", 0.1, 0.1, 20], { number: Iris.State(this.amplitude) });
    if (amplitude.numberChanged())
      this.amplitude = amplitude.state.number.get();

    const frequency = Iris.SliderNum(["Frequency", 0.1, 0, 20], { number: Iris.State(this.frequency) });
    if (frequency.numberChanged())
      this.frequency = frequency.state.number.get();

    const phaseShift = Iris.SliderNum(["Phase Shift", 0.01, 0, 5], { number: Iris.State(this.phaseShift) });
    if (phaseShift.numberChanged())
      this.phaseShift = phaseShift.state.number.get();

    const verticalShift = Iris.SliderNum(["Vertical Shift", 0.01, 0, 5], { number: Iris.State(this.verticalShift) });
    if (verticalShift.numberChanged())
      this.verticalShift = verticalShift.state.number.get();
  }
}