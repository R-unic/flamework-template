import { Modding } from "@flamework/core";
import { RunService as Runtime } from "@rbxts/services";

import { roundDecimal } from "./utility/numbers";
import Log from "./logger";

/** Only allow the function to be executed once every `waitTime` seconds */
export const Debounce = Modding.createDecorator<[waitTime: number]>(
  "Method",
  (descriptor, [waitTime]) => {
    let canCall = true;
    const object = <Record<string, Callback>>Modding.resolveSingleton(descriptor.constructor!);
    const originalMethod = object[descriptor.property];
    object[descriptor.property] = function (...args: unknown[]) {
      if (!canCall) return;
      canCall = false;
      task.delay(waitTime, () => canCall = true);

      return originalMethod(...args);
    };
  }
);

/** Cache the first result the function returns and return the cached result from then on out */
export const Memoize = Modding.createDecorator<[]>(
  "Method",
  descriptor => {
    const object = <Record<string, Callback>>Modding.resolveSingleton(descriptor.constructor!);
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
  }
);

/** Only allows the function to be executed in studio */
export const StudioOnly = Modding.createDecorator<[]>(
  "Method",
  descriptor => {
    const object = <Record<string, Callback>>Modding.resolveSingleton(descriptor.constructor!);
    const originalMethod = object[descriptor.property];

    object[descriptor.property] = function (...args: unknown[]) {
      if (Runtime.IsStudio())
        originalMethod(...args);
    };
  }
);

/** Benchmark how long the function takes to run */
export const LogBenchmark = Modding.createDecorator<[formatter?: (secondsElapsed: number, methodName: string) => string]>(
  "Method",
  (descriptor, [formatter]) => {
    const object = <Record<string, Callback>>Modding.resolveSingleton(descriptor.constructor!);
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
  }
);