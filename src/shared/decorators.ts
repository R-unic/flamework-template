import { Modding } from "@flamework/core";

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