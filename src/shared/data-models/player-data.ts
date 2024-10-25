export const INITIAL_GLOBAL_DATA: GlobalData = {

};

export interface GlobalData {

}

export const INITIAL_DATA: PlayerData = {
  coins: 0,
  purchaseHistory: []
};

export interface PlayerData {
  readonly coins: number;
  readonly purchaseHistory: string[];
}

export function getDirectoryForPlayer(player: Player, directory: string): string {
  return `playerData/${player.UserId}/${directory}`;
}