import { HttpService as HTTP } from "@rbxts/services";

export default class Unique {
  public readonly id = HTTP.GenerateGUID();
}