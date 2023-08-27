import { BaseComponent } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";

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

  protected abstract active(): void;
  protected abstract inactive(): void;

  public connectEvents(): void {
    this.maid.GiveTask(this.instance.MouseEnter.Connect(() => this.active()));
    this.maid.GiveTask(this.instance.MouseLeave.Connect(() => this.inactive()));
    if (this.includeClick) {
      this.maid.GiveTask(this.instance.MouseButton1Down.Connect(() => this.inactive()));
      this.maid.GiveTask(this.instance.MouseButton1Up.Connect(() => this.active()));
    }
  }
}