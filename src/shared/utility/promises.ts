interface DelayUntilOptions {
  /** Delays until the value returned by this function returns true or the signal fires */
  readonly condition: RBXScriptSignal | (() => boolean);
  /** The interval between each check of the condition */
  readonly checkInterval: number;
  /** Whether it should check the condition at the start of the loop */
  readonly initialCheck?: boolean;
  /** The maximum amount of time the delay can last */
  readonly timeout?: number
}

export async function delayUntil({ condition, checkInterval, initialCheck, timeout }: DelayUntilOptions): Promise<void> {
  return new Promise(async (resolve, reject) => {
    let elapsed = 0;
    if (!typeIs(condition, "function")) {
      await promisifyEvent(condition);
      return;
    }

    do {
      if (initialCheck ?? true)
        if (await condition()) break;

      elapsed += task.wait(checkInterval);
      if (timeout !== undefined && elapsed >= timeout) {
        reject(`delayUntil timeout of ${timeout} seconds exceeded`);
        break;
      }
    } while (!condition());
    resolve();
  });
}

export async function promisifyEvent<Args extends unknown[]>(event: RBXScriptSignal<(...args: Args) => void>): Promise<Args> {
  return new Promise(resolve => event.Once((...args) => resolve(args)));
}