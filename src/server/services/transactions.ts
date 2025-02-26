import { OnInit, Service } from "@flamework/core";
import { MarketplaceService as Market, Players } from "@rbxts/services";

import { DataService } from "./third-party/data";
import Log from "shared/log";

type RewardHandler = (player: Player) => void;
const enum ProductIDs {
  // Gold5000 = 1620635951,
}

@Service()
export class TransactionsService implements OnInit {
  private readonly rewardHandlers: Record<number, RewardHandler> = {
    // [ProductIDs.Gold5000]: player => this.db.increment(player, "gold", 5000)
  }

  public constructor(
    private readonly data: DataService
  ) { }

  public onInit(): void {
    Market.ProcessReceipt = ({ PlayerId, ProductId, PurchaseId }) => {
      const productKey = `${PlayerId}_${PurchaseId}`;
      const player = Players.GetPlayerByUserId(PlayerId);
      const playerExists = player !== undefined;

      let purchaseRecorded: Maybe<boolean> = true;
      if (playerExists) {
        const data = this.data.get(player);
        const alreadyPurchased = data.purchaseHistory.includes(productKey);
        if (alreadyPurchased)
          return Enum.ProductPurchaseDecision.PurchaseGranted;
      } else
        purchaseRecorded = undefined;

      let success = true;
      try {
        const grantReward = this.rewardHandlers[ProductId];
        if (playerExists)
          grantReward?.(player);
      } catch (err) {
        success = false;
        purchaseRecorded = undefined;
        Log.warn(`Failed to process purchase for product ${ProductId}: ${err}`);
      }

      return Enum.ProductPurchaseDecision[(!success || purchaseRecorded === undefined) ? "NotProcessedYet" : "PurchaseGranted"];
    }
  }
}