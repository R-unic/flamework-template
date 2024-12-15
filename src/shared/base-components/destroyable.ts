import { BaseComponent } from "@flamework/components";
import { Janitor } from "@rbxts/janitor";

export default class DestroyableComponent<A extends {} = {}, I extends Instance = Instance> extends BaseComponent<A, I> {
  protected readonly janitor = new Janitor;

  public destroy(): void {
    if (!("Destroy" in this.janitor)) return;
    this.janitor.Destroy();
  }
}