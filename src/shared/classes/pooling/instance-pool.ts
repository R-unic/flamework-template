import { Dependency } from "@flamework/core";
import { BaseComponent, Component, type Components } from "@flamework/components";
import { slice } from "@rbxts/string-utils";

interface BaseInstancePool<T extends PoolableInstance<Instance>> {
  take(): T;
}

@Component()
export abstract class PoolableInstance<T extends Instance> extends BaseComponent<{}, T> {
  public abstract initialize(returnFunction: (poolable: PoolableInstance<T>) => void): void;
  public abstract returnToPool(): void;
}

export abstract class InstancePool<T extends PoolableInstance<Instance>> implements BaseInstancePool<T> {
  private readonly components = Dependency<Components>();
  private readonly pooledInstances: T[] = [];

  public constructor(
    private readonly tag: string,
    private readonly filePath: string,
    private readonly prefab: T["instance"],
    private readonly parent?: Instance,
    fillAmount = 0
  ) {
    const parts = this.filePath.split("/"); // remove "src"
    parts.remove(0);

    this.filePath = slice(parts.join("/"), 0, -3) // remove file extension
    this.spawn(fillAmount);
  }

  public take(): T {
    const createInstance = this.getPooledCount() === 0;
    let poolable = createInstance ?
      this.createPoolableInstance()
      : this.pooledInstances.pop()!;

    poolable.initialize(instance => this.return(<T>instance));
    return poolable;
  }


  public getPooledCount(): number {
    return this.pooledInstances.size();
  }

  protected spawn(amount: number): void {
    for (const _ of $range(1, amount))
      this.createPoolableInstance();
  }

  private return(poolable: T): void {
    this.pooledInstances.push(poolable);
  }

  private createPoolableInstance(): T {
    const instance = this.prefab.Clone();
    instance.Parent = this.parent;
    instance.AddTag(this.tag);

    const poolable: T = this.components.getComponent(instance, `${this.filePath}@${this.tag}`)!;
    poolable.returnToPool();
    return poolable;
  }
}