/** Lazy loader */
export default class Lazy<T> {
  private value?: T;

  public constructor(
    private readonly evaluate: () => T
  ) { }

  public getValue(): T {
    if (this.value === undefined)
      this.value = this.evaluate();

    return this.value;
  }
}