export default interface ProceduralAnimation<O extends Vector3 | CFrame = Vector3> {
  start(...extra: any): void;
  update(dt: number): O;
}