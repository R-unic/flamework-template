import { BaseComponent } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { Janitor } from "@rbxts/janitor";

interface Attributes {
  Hover?: boolean;
  Click?: boolean;
}

export default abstract class ButtonAnimation<
  A extends object = {},
  I extends GuiButton = GuiButton
> extends BaseComponent<Attributes & A, I> {

  protected readonly abstract tweenInfo: TweenInfoBuilder;
  protected readonly includeClick: boolean = true;
  protected readonly janitor = new Janitor;

  protected abstract active(): void;
  protected abstract inactive(): void;

  public connectEvents(): void {
    this.janitor.Add(this.instance.MouseEnter.Connect(() => this.active()));
    this.janitor.Add(this.instance.MouseLeave.Connect(() => this.inactive()));
    if (this.includeClick) {
      this.janitor.Add(this.instance.MouseButton1Down.Connect(() => this.inactive()));
      this.janitor.Add(this.instance.MouseButton1Up.Connect(() => this.active()));
    }
  }
}