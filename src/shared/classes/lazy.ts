/** Lazy loader */
export default class Lazy<T> {
  private value?: T;

  public constructor(
    private readonly initialize: () => T
  ) { }

  public getValue(): T {
    if (this.value === undefined)
      this.value = this.initialize();

    return this.value;
  }
}