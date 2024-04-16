// purely for hinting, no functional purpose
type int = number & {
    /**
     * @hidden
     */
    __marker?: void;
};
type uint = number & {
    /**
     * @hidden
     */
    __marker?: void;
};
type short = number & {
    /**
     * @hidden
     */
    __marker?: void;
};
type ushort = number & {
    /**
     * @hidden
     */
    __marker?: void;
};
type byte = number & {
    /**
     * @hidden
     */
    __marker?: void;
};
type sbyte = number & {
    /**
     * @hidden
     */
    __marker?: void;
};
type float = number & {
    /**
     * @hidden
     */
    __marker?: void;
};
type hfloat = number & {
    /**
     * @hidden
     */
    __marker?: void;
};
type DWORD = number & {
    /**
     * @hidden
     */
    __marker?: void;
};
type Buffer = byte[] & {
    /**
     * @hidden
     */
    __marker?: void;
};

type Maybe<T> = T | undefined;

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