interface PackageJson {
  readonly name: Lowercase<string>;
  readonly version: string;
  readonly description?: string;
  readonly main?: string;
  readonly scripts?: Record<string, string>;
  readonly repository?: {
    readonly type: string;
    readonly url: string;
  };
  readonly keywords?: string[];
  readonly bugs?: {
    readonly url: string;
  };
  readonly author?: string;
  readonly license?: string;
  readonly homepage?: string;
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
}

export default PackageJson;