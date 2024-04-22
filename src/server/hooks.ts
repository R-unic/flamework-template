export interface OnPlayerLeave {
  onPlayerLeave(player: Player): void;
}

export interface OnPlayerJoin {
  onPlayerJoin(player: Player): void;
}

export interface OnDataUpdate<T = unknown> {
  onDataUpdate(player: Player, directory: string, value: T): void;
}