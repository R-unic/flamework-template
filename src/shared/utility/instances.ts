import { TweenService, ReplicatedFirst, RunService as Runtime, MarketplaceService as Market, Players } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";

export const Assets = ReplicatedFirst.Assets;

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

export interface DevProductInfo {
  readonly Description: string;
  readonly PriceInRobux: number;
  readonly ProductId: number;
  readonly IconImageAssetId: number;
  readonly Name: string;
}

export async function getDevProducts(): Promise<DevProductInfo[]> {
  return await getPageContents(Market.GetDeveloperProductsAsync());
}

export async function getPageContents<T extends defined>(pages: Pages<T>): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const contents: T[] = [];
    try {
      while (task.wait()) {
        const page = pages.GetCurrentPage();
        for (const item of page)
          contents.push(item);

        if (pages.IsFinished) break;
        pages.AdvanceToNextPageAsync();
      }
    } catch (err) {
      reject(err);
    }

    resolve(contents);
  });
}

export function getDescendantsOfType<T extends keyof Instances, I extends Instances[T] = Instances[T]>(instance: Instance, className: T): I[] {
  return instance.GetDescendants().filter((child): child is I => child.IsA(className));
}

export function getChildrenOfType<T extends keyof Instances, I extends Instances[T] = Instances[T]>(instance: Instance, className: T): I[] {
  return instance.GetChildren().filter((child): child is I => child.IsA(className));
}

export function getCharacterParts(character: Model): BasePart[] {
  return getDescendantsOfType(character, "BasePart");
}

export function getInstancePath(instance: Instance): string {
  let path = instance.GetFullName()
    .gsub("Workspace", "World")[0]
    .gsub("PlayerGui", "UI")[0];

  if (Runtime.IsClient())
    path = path.gsub(`Players.${Players.LocalPlayer.Name}.`, "")[0];

  return path;
}

/**
 * Note: Only gets instances from paths acquired using Instance.GetFullName()
 */
export function getInstanceFromPath<I extends Instance = Instance>(path: string | string[], root: Instance = game): Maybe<I> {
  const pieces = typeOf(path) === "string" ? (<string>path).split(".") : <string[]>path;
  let result: Maybe<Instance> = root;

  for (const piece of pieces)
    result = result?.FindFirstChild(piece);

  return <I>result;
}