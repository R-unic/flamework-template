import { Modding } from "@flamework/core";

/** Only allow the function to be executed once every `waitTime` seconds */
export const Debounce = Modding.createDecorator<[waitTime: number]>(
  "Method",
  (descriptor, [waitTime]) => {
    let canCall = true;
    const object = <Record<string, Callback>><unknown>descriptor.object;
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
    const object = <Record<string, Callback>><unknown>descriptor.object;
    const originalMethod = object[descriptor.property];
    const memoizationCache: Record<string, Record<string, unknown>> = table.clone({});
    const objectKey = tostring(object);
    const functionKey = tostring(originalMethod);
    memoizationCache[objectKey] ??= {};

    object[descriptor.property] = function (...args: unknown[]) {
      if (memoizationCache[objectKey][functionKey] === undefined) {
        const result = originalMethod(...args);
        memoizationCache[objectKey][functionKey] = result;
      }

      return memoizationCache[objectKey][functionKey];
    };
  }
);
