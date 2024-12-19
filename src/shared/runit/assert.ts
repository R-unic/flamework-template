class AssertionFailedException {
  public readonly message: string;

  public constructor(expected: unknown, actual: unknown);
  public constructor(message: string);
  public constructor(
    message: unknown,
    actual?: unknown
  ) {
    this.message = actual !== undefined ? `Expected: ${message}\nActual: ${actual}` : <string>message;
    error(this.toString(), 4);
  }

  public toString(): string {
    return `Test failed!\n${this.message}`;
  }
}

class Assert {
  public static true(value: unknown): void {
    this.equal(true, value);
  }

  public static false(value: unknown): void {
    this.equal(false, value);
  }

  public static undefined(value: unknown): void {
    this.equal(undefined, value);
  }

  public static notUndefined(value: unknown): void {
    if (value !== undefined) return;
    throw new AssertionFailedException(`Expected value to not be undefined`);
  }

  public static contains<T extends defined>(array: T[], predicate: (element: T) => boolean): void {
    if (array.some(predicate)) return;
    throw new AssertionFailedException("Array did not contain any elements matching the predicate");
  }

  public static equal(expected: unknown, actual: unknown): void {
    if (expected === actual) return;
    throw new AssertionFailedException(expected, actual);
  }
}

export = Assert;