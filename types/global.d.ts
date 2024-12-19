interface SerializedPacket {
  readonly buffer: buffer;
  readonly blobs: defined[];
}

type Maybe<T> = T | undefined;
type EnumObject<T extends string | number = string | number> = Record<string, T> & Record<T, string>;
type If<Value extends boolean, TrueResult, FalseResult = null> = Value extends true
  ? TrueResult
  : Value extends false
  ? FalseResult
  : TrueResult | FalseResult;

type DeepReadonly<T> =
  T extends (infer R)[] ? DeepReadonlyArray<R> :
  T extends Callback ? T :
  T extends object ? DeepReadonlyObject<T> :
  T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> { }

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

type DeepWritable<T> =
  T extends (infer R)[] ? DeepWritableArray<R> :
  T extends Callback ? T :
  T extends object ? DeepWritableObject<T> :
  T;

interface DeepWritableArray<T> extends Array<DeepWritable<T>> { }

type DeepWritableObject<T> = {
  -readonly [P in keyof T]: DeepWritable<T[P]>;
};

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
  ? DeepPartial<U>[]
  : T[P] extends object
  ? DeepPartial<T[P]>
  : T[P];
};