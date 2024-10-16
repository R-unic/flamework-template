
export const INITIAL_DATA: PlayerData = {
  coins: 0
};

export interface PlayerData {
  readonly coins: number;
}

export function getDirectoryForPlayer(player: Player, directory: string): string {
  return `playerData/${player.UserId}/${directory}`;
}