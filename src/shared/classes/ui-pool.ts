import { Component } from "@flamework/components";
import { $file, $nameof } from "rbxts-transform-debug";

import { InstancePool, PoolableInstance } from "./instance-pool";

@Component({ tag: $nameof<PoolableUI>() })
export class PoolableUI extends PoolableInstance<GuiObject> {
  private returnFunction?: (poolable: PoolableUI) => void;

  public initialize(returnFunction: (poolable: PoolableUI) => void): void {
    this.returnFunction = returnFunction;
    this.instance.Visible = true;
  }

  public returnToPool(): void {
    this.returnFunction?.(this);
    this.instance.Visible = false;
  }
}

export class UIPool extends InstancePool<PoolableUI> {
  public constructor(prefab: GuiObject, parent?: Instance, fillAmount?: number) {
    const tag = $nameof<PoolableUI>();
    super(tag, $file.filePath, prefab, parent, fillAmount);
  }
}