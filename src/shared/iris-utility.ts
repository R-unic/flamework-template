import Quaternion from "@rbxts/quaternion";
import Iris from "@rbxts/iris";

export function createVector3Tree(
  vector: Vector3,
  name = "Vector3",
  increment = Vector3.one.mul(0.1),
  minimum = Vector3.one.mul(-100),
  maximum = Vector3.one.mul(100)
): Vector3 {
  let resultVector: Vector3;

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
  let x, y, z, w;

  Iris.Tree([name]);

  const xSlider = Iris.SliderNum(["X", increment, minimum, maximum], { number: Iris.State(quaternion.x) });
  if (xSlider.numberChanged())
    x = xSlider.state.number.get();

  const ySlider = Iris.SliderNum(["Y", increment, minimum, maximum], { number: Iris.State(quaternion.y) });
  if (ySlider.numberChanged())
    y = ySlider.state.number.get();

  const zSlider = Iris.SliderNum(["Z", increment, minimum, maximum], { number: Iris.State(quaternion.z) });
  if (zSlider.numberChanged())
    z = zSlider.state.number.get();

  const wSlider = Iris.SliderNum(["W", increment, minimum, maximum], { number: Iris.State(quaternion.w) });
  if (wSlider.numberChanged())
    w = wSlider.state.number.get();

  Iris.End();

  return new Quaternion(x!, y!, z!, w!);
}