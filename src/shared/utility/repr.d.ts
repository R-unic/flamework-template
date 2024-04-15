interface ReprOptions {
  readonly spaces?: number;
  readonly tabs?: boolean;
  readonly pretty?: boolean;
  readonly semicolons?: boolean;
  readonly sortKeys?: boolean;
  readonly robloxFullName?: boolean;
  readonly robloxProperFullName?: boolean;
  readonly robloxClassName?: boolean;
}

declare function repr(value: unknown, options?: ReprOptions): string;

export = repr;