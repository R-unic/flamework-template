interface Instance {
  WaitForChild<T extends Instance = Instance>(childName: string): T;
  WaitForChild<T extends Instance = Instance>(childName: string, timeout: number): Maybe<T>;
  FindFirstChild<T extends Instance = Instance>(childName: string | number, recursive?: boolean): Maybe<T>;
  FindFirstAncestor<T extends Instance = Instance>(name: string | number): Maybe<T>;
  FindFirstDescendant<T extends Instance = Instance>(name: string | number): Maybe<T>;
  GetAttribute<T extends AttributeValue>(attribute: string): Maybe<T>;
}