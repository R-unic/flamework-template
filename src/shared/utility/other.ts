import { Modding } from "@flamework/core";
import { t } from "@rbxts/t";

/**
 * Macro that generates a type guard (if one is not specified) then if the guard passes, returns the casted value
 *
 * @metadata macro
 */
export function safeCast<T>(value: unknown, guard?: t.check<T> | Modding.Generic<T, "guard">): Maybe<T> {
  return guard !== undefined ?
    (guard(value) ? value : undefined)
    : undefined;
}

export async function promisifyEvent<Args extends unknown[]>(event: RBXScriptSignal<(...args: Args) => void>): Promise<Args> {
  return new Promise(resolve => event.Once((...args) => resolve(args)));
}

interface DelayUntilOptions {
  /** Delays until the value returned by this function returns true */
  readonly condition: () => boolean;
  /** The interval between each check of the condition */
  readonly checkInterval: number;
  /** Whether it should check the condition at the start of the loop */
  readonly initialCheck?: boolean;
  /** The maximum amount of time the delay can last */
  readonly timeout?: number
}

export async function delayUntil({ condition, checkInterval, initialCheck, timeout }: DelayUntilOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    let elapsed = 0;
    do {
      if (initialCheck ?? true)
        if (condition()) break;

      elapsed += task.wait(checkInterval);
      if (timeout !== undefined && elapsed >= timeout) {
        reject(`delayUntil timeout of ${timeout} seconds exceeded`);
        break;
      }
    } while (!condition());
    resolve();
  });
}