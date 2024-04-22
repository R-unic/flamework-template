export interface OnDataUpdate<T = unknown> {
  onDataUpdate(directory: string, value: T): void;
}