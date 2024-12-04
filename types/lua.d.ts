interface String {
  lower<T extends string>(this: T): Lowercase<T>;
  upper<T extends string>(this: T): Uppercase<T>;
}