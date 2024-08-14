import { HttpService as HTTP } from "@rbxts/services";

export class UUID implements BaseID<string> {
  public readonly id = HTTP.GenerateGUID();
}

export class CumulativeID implements BaseID<number> {
  private static accumulation = 0;
  public readonly id = CumulativeID.accumulation++;
}

export interface BaseID<T> {
  readonly id: T;
}