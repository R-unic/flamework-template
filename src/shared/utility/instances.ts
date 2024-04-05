import { ReplicatedFirst, RunService as Runtime, MarketplaceService as Market } from "@rbxts/services";

export const Assets = ReplicatedFirst.Assets;

export interface DevProductInfo {
  readonly Description: string;
  readonly PriceInRobux: number;
  readonly ProductId: number;
  readonly IconImageAssetId: number;
  readonly Name: string;
}

export function getDevProducts(): DevProductInfo[] {
  return getPageContents(Market.GetDeveloperProductsAsync());
}

export function getPageContents<T extends defined>(pages: Pages<T>): T[] {
  const contents: T[] = [];
  while (!pages.IsFinished) {
    const page = pages.GetCurrentPage();
    for (const item of page)
      contents.push(item);

    pages.AdvanceToNextPageAsync();
  }

  return contents;
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