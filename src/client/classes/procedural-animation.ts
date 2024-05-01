export default interface ProceduralAnimation {
  start(...extra: any): void;
  update(dt: number): Vector3;
}