interface Instance {
  WaitForChild<K extends ExtractKeys<this, Instance> = ExtractKeys<this, Instance>>(childName: K): this[K];
  WaitForChild<K extends ExtractKeys<this, Instance> = ExtractKeys<this, Instance>>(childName: K, timeout: number): Maybe<this[K]>;
  WaitForChild<T extends Instance = Instance>(childName: string): T;
  WaitForChild<T extends Instance = Instance>(childName: string, timeout: number): Maybe<T>;
  FindFirstChild<K extends ExtractKeys<this, Instance> = ExtractKeys<this, Instance>>(childName: K, recursive?: boolean): this[K];
  FindFirstChild<T extends Instance = Instance>(childName: string | number, recursive?: boolean): Maybe<T>;
  FindFirstAncestor<T extends Instance = Instance>(name: string | number): Maybe<T>;
  FindFirstDescendant<T extends Instance = Instance>(name: string | number): Maybe<T>;
  GetAttribute<T extends AttributeValue = AttributeValue>(attribute: string): Maybe<T>;
}