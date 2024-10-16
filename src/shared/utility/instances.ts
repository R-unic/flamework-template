import { Workspace as World, SoundService as Sound, ReplicatedFirst, RunService as Runtime, MarketplaceService as Market } from "@rbxts/services";

import type { PlaySoundOptions } from "shared/structs/audio";

export const Assets = ReplicatedFirst.Assets;

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

export function playTemporarySound(soundTemplate: Sound, { parent, createContainerPart, position }: Partial<PlaySoundOptions> = {}, beforePlay?: (sound: Sound) => void): Sound {
  const sound = soundTemplate.Clone();
  if (createContainerPart) {
    if (parent === undefined) {
      const ignore = new Instance("Folder");
      ignore.Name = "Ignore";
      ignore.Parent = World;
    }

    const container = new Instance("Part", parent ?? World.FindFirstChild("Ignore"));
    container.Transparency = 1;
    container.Anchored = true;
    container.CanCollide = false;
    container.Size = Vector3.one;
    container.Position = position!;
    sound.Parent = container;
  } else
    sound.Parent = parent ?? Sound;

  sound.Ended.Once(() => sound.Destroy());
  beforePlay?.(sound);
  sound.Play();
  return sound;
}

export function getCharacterParts(character: Model): BasePart[] {
  return getDescendantsOfType(character, "BasePart");
}

export async function getInstancePath(instance: Instance): Promise<string> {
  let path = instance.GetFullName()
    .gsub("Workspace", "World")[0]
    .gsub("PlayerGui", "UI")[0];

  if (Runtime.IsClient()) {
    const { Player } = await import("./client");
    path = path.gsub(`Players.${Player.Name}.`, "")[0];
  }

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