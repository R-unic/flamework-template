import { OnInit, Service } from "@flamework/core";
import { MarketplaceService as Market, Players } from "@rbxts/services";

import { DatabaseService } from "./database";
import Log from "shared/logger";

type RewardHandler = (player: Player) => void;
const enum ProductIDs {
  // Gold5000 = 1620635951,
}

@Service()
export class TransactionService implements OnInit {
  private readonly rewardHandlers: Record<number, RewardHandler> = {
    // [ProductIDs.Gold5000]: player => this.db.increment(player, "gold", 5000)
  }

  public constructor(
    private readonly db: DatabaseService
  ) {}

  public onInit(): void {
    Market.ProcessReceipt = ({ PlayerId, ProductId, PurchaseId }) => {
      const productKey = `${PlayerId}_${PurchaseId}`;
      const player = Players.GetPlayerByUserId(PlayerId);
      let purchaseRecorded: Maybe<boolean> = true;
      if (player) {
        const purchaseHistory = this.db.get<string[]>(player, "purchaseHistory");
        const alreadyPurchased = purchaseHistory.includes(productKey);
        if (alreadyPurchased)
          return Enum.ProductPurchaseDecision.PurchaseGranted;
      } else
        purchaseRecorded = undefined;

      let success = true;
      try {
        const grantReward = this.rewardHandlers[ProductId];
        if (player && grantReward !== undefined)
          grantReward(player);
      } catch (e) {
        success = false;
        purchaseRecorded = undefined;
        Log.warning(`Failed to process purchase for product ${ProductId}: ${e}`);
      }

      return Enum.ProductPurchaseDecision[(!success || purchaseRecorded === undefined) ? "NotProcessedYet" : "PurchaseGranted"];
    }
  }
}