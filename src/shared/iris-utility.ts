import Quaternion from "@rbxts/quaternion";
import Wave from "@rbxts/wave";
import Iris from "@rbxts/iris";

export function createWaveTree(wave: Wave, name = "Wave"): Wave {
  let resultWave = wave;

  Iris.Tree([name]);
  {
    const useSin = Iris.Checkbox(["Is Sine Wave?"], { isChecked: Iris.State(wave.waveFunction === math.sin) });
    const amplitude = Iris.SliderNum(["Amplitude", 0.1, 0.1, 20], { number: Iris.State(wave.amplitude) });
    const frequency = Iris.SliderNum(["Frequency", 0.1, 0, 20], { number: Iris.State(wave.frequency) });
    const phaseShift = Iris.SliderNum(["Phase Shift", 0.01, 0, 5], { number: Iris.State(wave.phaseShift) });
    const verticalShift = Iris.SliderNum(["Vertical Shift", 0.01, 0, 5], { number: Iris.State(wave.verticalShift) });
    const damping = Iris.SliderNum(["Damping", 0.1, 1, 10], { number: Iris.State(wave.damping) });

    resultWave = new Wave(
      amplitude.state.number.get(),
      frequency.state.number.get(),
      phaseShift.state.number.get(),
      verticalShift.state.number.get(),
      damping.state.number.get(),
      useSin.state.isChecked.get() ? math.sin : math.cos
    );
  }
  Iris.End();

  return resultWave;
}

export function createVector3Tree(
  vector: Vector3,
  name = "Vector3",
  increment = Vector3.one.mul(0.1),
  minimum = Vector3.one.mul(-100),
  maximum = Vector3.one.mul(100)
): Vector3 {
  let resultVector = vector;

  Iris.Tree([name]);
  {
    const x = Iris.SliderNum(["X", increment.X, minimum.X, maximum.X], { number: vector.X });
    const y = Iris.SliderNum(["Y", increment.Y, minimum.Y, maximum.Y], { number: vector.Y });
    const z = Iris.SliderNum(["Z", increment.Z, minimum.Z, maximum.Z], { number: vector.Z });
    resultVector = new Vector3(x.state.number.get(), y.state.number.get(), z.state.number.get());
  }
  Iris.End();

  return resultVector;
}

export function createQuaternionTree(
  quaternion: Quaternion,
  name = "Quaternion",
  increment = 0.01,
  minimum = -1,
  maximum = 1
): Quaternion {
  let resultQuaternion = quaternion;

  Iris.Tree([name]);
  {
    const x = Iris.SliderNum(["X", increment, minimum, maximum], { number: Iris.State(quaternion.x) });
    const y = Iris.SliderNum(["Y", increment, minimum, maximum], { number: Iris.State(quaternion.y) });
    const z = Iris.SliderNum(["Z", increment, minimum, maximum], { number: Iris.State(quaternion.z) });
    const w = Iris.SliderNum(["W", increment, minimum, maximum], { number: Iris.State(quaternion.w) });

    resultQuaternion = new Quaternion(
      x.state.number.get(),
      y.state.number.get(),
      z.state.number.get(),
      w.state.number.get()
    )
  }
  Iris.End();

  return resultQuaternion;
}