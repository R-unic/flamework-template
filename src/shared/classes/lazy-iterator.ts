import Object from "@rbxts/object-utils";

import { createSymbol } from "../utility/meta";
import StringBuilder from "./string-builder";

type SkipSymbol = symbol & {
  __skip?: undefined;
};

export default class LazyIterator<T extends defined> {
  public static readonly Skip = createSymbol<SkipSymbol>("LazyIterator.Skip");
  private finished = false;

  public constructor(
    private nextItem: () => T | SkipSymbol
  ) { }

  public static fromKeys<K extends string | number | symbol>(object: Record<K, unknown>): LazyIterator<K> {
    return this.fromArray(<K[]>Object.keys(object));
  }

  public static fromValues<V extends defined>(object: Record<string | number | symbol, V>): LazyIterator<V> {
    return this.fromArray(Object.values(object));
  }

  public static fromArray<T extends defined>(array: T[]): LazyIterator<T> {
    let i = 0;
    return new LazyIterator(() => array[i++]);
  }

  public static fromSet<T extends defined>(set: Set<T>): LazyIterator<T> {
    return this.fromArray([...set]);
  }

  public isEqual(other: LazyIterator<T>): boolean {
    return this.every((item, i) => item === other.at(i))
  }

  public indexOf(value: T): number {
    let currentIndex = 0;
    while (!this.finished) {
      const currentValue = this.nextItem();
      if (currentValue === undefined) break;
      if (currentValue !== LazyIterator.Skip) {
        if (currentValue === value)
          return currentIndex;

        currentIndex++;
      }
    }

    return -1;
  }

  public first(): Maybe<T> {
    while (!this.finished) {
      const value = this.nextItem();
      if (value === undefined) break;
      if (value !== LazyIterator.Skip)
        return <T>value;
    }
  }

  public last(): Maybe<T> {
    let lastValue: Maybe<T> = undefined;
    while (!this.finished) {
      const value = this.nextItem();
      if (value === undefined) break
      if (value !== LazyIterator.Skip)
        lastValue = <T>value;
    }

    return lastValue;
  }

  public at(index: number): Maybe<T> {
    if (index < 0) return;

    let currentIndex = 0;
    while (!this.finished) {
      const value = this.nextItem();
      if (value === undefined) break;
      if (value !== LazyIterator.Skip)
        if (currentIndex++ === index)
          return <T>value;
    }
  }

  public append(element: T): LazyIterator<T> {
    const oldNext = this.nextItem;
    let exhausted = false;

    this.nextItem = () => {
      if (exhausted) return undefined!;

      const value = oldNext();
      if (value === undefined) {
        exhausted = true;
        return element;
      }

      return value;
    };

    return this;
  }

  public prepend(element: T): LazyIterator<T> {
    const oldNext = this.nextItem;
    let yielded = false;

    this.nextItem = () => {
      if (!yielded) {
        yielded = true;
        return element;
      }

      return oldNext();
    };

    return this;
  }

  public sort(comparator: (a: T, b: T) => boolean): LazyIterator<T> {
    const collectedItems = this.collect();
    if (!collectedItems) return this;

    collectedItems.sort(comparator);
    return LazyIterator.fromArray(collectedItems);
  }

  public map<U extends defined>(transform: (value: T) => U | SkipSymbol): LazyIterator<U> {
    const oldNext = this.nextItem;
    this.nextItem = () => {
      while (true) {
        const value = oldNext();
        if (value === undefined) return undefined!;

        if (value !== LazyIterator.Skip) {
          const transformed = transform(<T>value);
          if (transformed !== LazyIterator.Skip)
            return <never>transformed; // hack
        } else
          return LazyIterator.Skip;
      }
    };

    return <never>this; // hack
  }

  public filter<S extends T>(predicate: (value: T) => value is S): LazyIterator<S>
  public filter(predicate: (value: T) => boolean): LazyIterator<T>
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

  public find<S extends T>(predicate: (value: T) => value is S): Maybe<S>
  public find(predicate: (value: T) => boolean): Maybe<T>
  public find(predicate: (value: T) => boolean): Maybe<T> {
    return this.filter(predicate).first();
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

  public some(predicate: (value: T, index: number) => boolean): boolean {
    let index = 0;
    while (!this.finished) {
      const value = this.nextItem();
      if (value === undefined) break;
      if (value !== LazyIterator.Skip && predicate(<T>value, index++))
        return true;
    }

    return false;
  }

  public every(predicate: (value: T, index: number) => boolean): boolean {
    let index = 0;
    while (!this.finished) {
      const value = this.nextItem();
      if (value === undefined) break;
      if (value !== LazyIterator.Skip && !predicate(<T>value, index++))
        return false;
    }

    return true;
  }

  public join(separator: string): string {
    const result = new StringBuilder;
    let isFirstValue = true;

    while (!this.finished) {
      const value = this.nextItem();
      if (value === undefined) break;
      if (!isFirstValue)
        result.append(separator);
      if (isFirstValue)
        isFirstValue = false;
      if (value !== LazyIterator.Skip)
        result.append(tostring(value));
    }

    return result.toString();
  }

  public size(): number {
    let size = 0;
    this.collect(() => size++);
    return size;
  }

  public collect(process: (value: T) => void): void
  public collect(): T[]
  public collect(process?: (value: T) => void): Maybe<T[]> {
    let results: Maybe<T[]>;
    if (process === undefined) // don't allocate a table if we're not adding anything to it
      results = [];

    while (!this.finished) {
      const value = this.nextItem();
      if (value === undefined) {
        this.finished = true;
        break;
      }

      if (value !== LazyIterator.Skip)
        if (process !== undefined)
          process(<T>value);
        else
          results!.push(<T>value);
    }

    return process !== undefined ? undefined : results;
  }

  public collectIntoSet(): Set<T> {
    return new Set(this.collect())
  }
}