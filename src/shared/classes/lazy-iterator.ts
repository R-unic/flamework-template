import { createSymbol } from "shared/utility/meta";

export default class LazyIterator<T extends defined> {
  public static readonly Skip = createSymbol("LazyIterator.Skip");
  private finished = false;

  public constructor(
    private nextItem: () => T | symbol
  ) { }

  public static fromArray<T extends defined>(array: T[]): LazyIterator<T> {
    let i = 0;
    return new LazyIterator(() => array[i++]);
  }

  public map(transform: (value: T) => T | symbol): LazyIterator<T> {
    const oldNext = this.nextItem;
    this.nextItem = () => {
      while (true) {
        const value = oldNext();
        if (value === undefined) return undefined!;

        if (value !== LazyIterator.Skip) {
          const transformed = transform(<T>value);
          if (transformed !== LazyIterator.Skip)
            return transformed;
        } else
          return LazyIterator.Skip;
      }
    };

    return this;
  }

  public filter(predicate: (value: T) => boolean): LazyIterator<T> {
    const oldNext = this.nextItem;
    this.nextItem = () => {
      while (!this.finished) {
        const value = oldNext();
        if (value === undefined) return undefined!;
        if (value !== LazyIterator.Skip)
          return predicate(<T>value) ? value : LazyIterator.Skip;
        else
          return LazyIterator.Skip;
      }

      return undefined!;
    };

    return this;
  }

  public take(amount: number): LazyIterator<T> {
    let count = 0;
    const oldNext = this.nextItem;
    this.nextItem = () => {
      if (count >= amount) {
        this.finished = true;
        return undefined!;
      }

      while (true) {
        const value = oldNext();
        if (value === LazyIterator.Skip) continue;
        if (value === undefined) return undefined!;

        count++;
        return value;
      }
    };

    return this;
  }

  public skip(amount: number): LazyIterator<T> {
    let count = 0;
    const oldNext = this.nextItem;
    this.nextItem = () => {
      if (count < amount) {
        const value = oldNext();
        if (value === LazyIterator.Skip) return value;
        count++;
      }

      return oldNext();
    };

    return this;
  }

  public reduce(reducer: (accumulation: T, value: T) => T): Maybe<T> {
    let accumulation: Maybe<T> = undefined;
    while (!this.finished) {
      const value = this.nextItem();
      if (value === undefined) break;
      if (value !== LazyIterator.Skip) {
        if (accumulation === undefined)
          accumulation = <T>value
        else
          accumulation = reducer(accumulation, <T>value);
      }
    }

    return accumulation;
  }

  public fold(reducer: (accumulation: T, value: T) => T, initial: T): Maybe<T> {
    let accumulation = initial;
    while (!this.finished) {
      const value = this.nextItem();
      if (value === undefined) break;
      if (value !== LazyIterator.Skip)
        accumulation = reducer(accumulation, <T>value);
    }

    return accumulation;
  }

  public any(predicate: (value: T) => boolean): boolean {
    while (!this.finished) {
      const value = this.nextItem();
      if (value === undefined) break;
      if (value !== LazyIterator.Skip && predicate(<T>value))
        return true;
    }

    return false;
  }

  public all(predicate: (value: T) => boolean): boolean {
    while (!this.finished) {
      const value = this.nextItem();
      if (value === undefined) break;
      if (value !== LazyIterator.Skip && !predicate(<T>value))
        return false;
    }

    return true;
  }

  public collect(process?: Callback): Maybe<T[]> {
    const results: T[] = [];
    while (!this.finished) {
      const value = this.nextItem();
      if (value === undefined) break;
      if (value !== LazyIterator.Skip)
        if (process !== undefined)
          process(value)
        else
          results.push(<T>value);
    }

    return process !== undefined ? undefined : results;
  }
}