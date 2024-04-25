export interface GamepassInfo {
  readonly id: number;
  readonly name: string;
  readonly displayName: string;
  readonly productId: number;
  readonly price: number;
  readonly sellerName: string;
  readonly sellerId: number;
  readonly isOwned: boolean;
}