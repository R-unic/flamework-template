export class StorableVector3 {
  public static fromVector3({ X, Y, Z }: Vector3): StorableVector3 {
    return new StorableVector3(X, Y, Z);
  }

  public constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number
  ) { }
}