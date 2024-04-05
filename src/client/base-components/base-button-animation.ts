import type { OnStart } from "@flamework/core";
import { BaseComponent } from "@flamework/components";
import { Janitor } from "@rbxts/janitor";

export default abstract class BaseButtonAnimation<A extends {} = {}, I extends GuiButton = GuiButton> extends BaseComponent<A, I> implements OnStart {
  protected readonly includeClick: boolean = true;
  protected readonly janitor = new Janitor;
  protected hovered = false;

  protected abstract active?(): void;
  protected abstract inactive?(): void;

  public onStart(): void {
    this.janitor.Add(this.instance.MouseEnter.Connect(() => {
      this.hovered = true;
      this.active?.();
    }));
    this.janitor.Add(this.instance.MouseLeave.Connect(() => {
      this.hovered = false;
      this.inactive?.();
    }));
    if (this.includeClick) {
      this.janitor.Add(this.instance.MouseButton1Down.Connect(() => {
        this.hovered = false;
        this.inactive?.();
      }));
      this.janitor.Add(this.instance.MouseButton1Up.Connect(() => {
        this.hovered = true;
        this.active?.();
      }));
    }
  }
}