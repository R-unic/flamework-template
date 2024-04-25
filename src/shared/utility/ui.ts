import { TweenService } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";

export function tween<T extends Instance = Instance>(
  instance: T,
  tweenInfo: TweenInfo | TweenInfoBuilder,
  goal: Partial<ExtractMembers<T, Tweenable>>
): Tween {
  if (tweenInfo instanceof TweenInfoBuilder)
    tweenInfo = tweenInfo.Build();

  const tween = TweenService.Create(instance, tweenInfo, goal);
  tween.Play();

  return tween;
}