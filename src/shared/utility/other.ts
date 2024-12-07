import { t } from "@rbxts/t";

export function safeCast<T>(value: never, typeGuard: t.check<T>): Maybe<T> {
  return typeGuard(value) ? value : undefined;
}

export async function promisifyEvent<Args extends unknown[]>(event: RBXScriptSignal<(...args: Args) => void>): Promise<Args> {
  return new Promise(resolve => event.Once((...args) => resolve(args)));
}

export async function delayUntil(interval: number, condition: () => boolean, initialCheck = true, timeout?: number): Promise<void> {
  return new Promise((resolve, reject) => {
    let elapsed = 0;
    do {
      if (initialCheck)
        if (condition()) break;

      elapsed += task.wait(interval);
      if (timeout !== undefined && elapsed >= timeout) {
        reject(`delayUntil timeout of ${timeout} seconds exceeded`);
        break;
      }
    } while (!condition());
    resolve();
  });
}