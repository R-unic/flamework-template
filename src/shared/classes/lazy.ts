import { Memoize } from "shared/decorators";

/** Lazy loader */
export default class Lazy<T> {
  public constructor(
    private readonly initialize: () => T
  ) { }

  @Memoize()
  public getValue(): T {
    return this.initialize();;
  }
}