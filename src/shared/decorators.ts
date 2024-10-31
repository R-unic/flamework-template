import { Modding } from "@flamework/core";
import { RunService as Runtime } from "@rbxts/services";

import { roundDecimal } from "./utility/numbers";
import Log from "./logger";

/**
 * Wraps the function in a `task.spawn()`
 *
 * **Note:** Voids the return value
 * */
export const SpawnTask = Modding.createDecorator(
  "Method",
  descriptor => {
    const object = <Record<string, Callback>><unknown>descriptor.constructor!;
    const originalMethod = object[descriptor.property];
    object[descriptor.property] = (...args: unknown[]) => task.spawn(originalMethod, ...args);
  }
);


/** Calls `whenInvalid` when `validator` returns false */
export const ValidateReturn = Modding.createDecorator<[validator: (returnValue: unknown) => boolean, whenInvalid?: (returnValue: unknown) => void, warnNotError?: boolean]>(
  "Method",
  (descriptor, [validator, whenInvalid, warnNotError]) => {
    // FlameworkIgnited.Once(() => {
    const object = <Record<string, Callback>><unknown>descriptor.constructor!;
    const originalMethod = object[descriptor.property];
    warnNotError ??= false;
    whenInvalid ??= value => Log[warnNotError ? "warning" : "fatal"](`Invalid return value ${value} returned by ${tostring(descriptor.constructor)}.${descriptor.property}()`);

    object[descriptor.property] = function (...args: unknown[]) {
      const value = originalMethod(...args);
      const isValid = validator(value);
      if (!isValid)
        whenInvalid!(value);

      return value;
    };
    // });
  }
);

/** Retries the function every time `retryCondition` returns true, `times` times, with `delay` seconds in between */
export const Retry = Modding.createDecorator<[times: number, delay?: number, retryCondition?: (fn: () => void) => boolean]>(
  "Method",
  (descriptor, [times, delay, retryCondition]) => {
    // FlameworkIgnited.Once(() => {
    const object = <Record<string, Callback>><unknown>descriptor.constructor!;
    const originalMethod = object[descriptor.property];
    delay ??= 0;
    retryCondition ??= fn => {
      try {
        fn();
        return false;
      } catch (e) {
        Log.fatal(`Failed to retry ${tostring(descriptor.constructor!)}.${descriptor.property}(): ${e}`);
        return true;
      }
    };

    object[descriptor.property] = function (...args: unknown[]) {
      const wrappedMethod = (...retryArgs: unknown[]) => retryArgs.size() > 0 ? originalMethod(...retryArgs) : originalMethod(...args);
      let shouldRetry = retryCondition!(wrappedMethod); // calls originalMethod
      let retries = 0;
      while (shouldRetry && retries < times) {
        retries++;
        if (delay! > 0)
          task.wait(delay);

        shouldRetry = retryCondition!(wrappedMethod);
      }
    };
    // });
  }
);

/** Only allows the function to be executed once every `length` seconds */
export const Cooldown = Modding.createDecorator<[length: number]>(
  "Method",
  (descriptor, [length]) => {
    // FlameworkIgnited.Once(() => {
    let canCall = true;
    const object = <Record<string, Callback>><unknown>descriptor.constructor!;
    const originalMethod = object[descriptor.property];
    object[descriptor.property] = function (...args: unknown[]) {
      if (!canCall) return;
      canCall = false;
      task.delay(length, () => canCall = true);

      return originalMethod(...args);
    };
    // });
  }
);

/** Cache the first result the function returns and return the cached result from then on out */
export const Memoize = Modding.createDecorator<[]>(
  "Method",
  descriptor => {
    // FlameworkIgnited.Once(() => {
    const object = <Record<string, Callback>><unknown>descriptor.constructor!;
    const originalMethod = object[descriptor.property];
    const memoizationCache: Record<string, Record<string, unknown>> = table.clone({});
    const key = tostring(originalMethod);

    object[descriptor.property] = function (...args: unknown[]) {
      if (memoizationCache[key] === undefined) {
        const result = originalMethod(...args);
        memoizationCache[key] = result;
      }

      return memoizationCache[key];
    };
    // });
  }
);

/** Only allows the function to be executed in studio */
export const StudioOnly = Modding.createDecorator<[]>(
  "Method",
  descriptor => {
    // FlameworkIgnited.Once(() => {
    const object = <Record<string, Callback>><unknown>descriptor.constructor!;
    const originalMethod = object[descriptor.property];

    object[descriptor.property] = function (...args: unknown[]) {
      if (Runtime.IsStudio())
        originalMethod(...args);
    };
    // });
  }
);

/** Benchmark how long the function takes to run */
export const LogBenchmark = Modding.createDecorator<[formatter?: (secondsElapsed: number, methodName: string) => string]>(
  "Method",
  (descriptor, [formatter]) => {
    // FlameworkIgnited.Once(() => {
    const object = <Record<string, Callback>><unknown>descriptor.constructor!;
    const originalMethod = object[descriptor.property];
    formatter ??= (elapsed, name) => `Method "${name}" took ${roundDecimal(elapsed, 3)} seconds to execute.`;

    object[descriptor.property] = function (...args: unknown[]) {
      const startTime = os.clock();
      const result = originalMethod(...args);
      const endTime = os.clock();
      const elapsed = endTime - startTime;
      Log.info(formatter!(elapsed, descriptor.property));
      return result;
    };
    // });
  }
);