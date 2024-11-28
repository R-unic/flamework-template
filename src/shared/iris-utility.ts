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