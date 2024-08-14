import { Service, OnTick } from "@flamework/core";
import Object from "@rbxts/object-utils";
import Signal from "@rbxts/signal";

/**
 * Used for executing a function in a loop without creating a new thread
 */
@Service()
export class SchedulingService implements OnTick {
  private counter = 0;
  public every = <const>{
    second: new Signal
  };

  public onTick(step: number): void {
    this.counter += step;
    for (const [unit, signal] of Object.entries(this.every))
      task.spawn(() => {
        const increment = this.getIncrement(unit);
        if (this.counter >= increment) {
          this.counter -= increment;
          signal.Fire();
        }
      });
  }

  /** Note: Your callback should **always** yield! */
  public runForever(callback: Callback): void {
    task.spawn(() => {
      while (true)
        callback();
    });
  }

  private getIncrement(unit: keyof typeof this.every): number {
    switch (unit) {
      case "second": return 1;
    }
  }
}