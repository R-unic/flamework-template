import { Service, type OnInit } from "@flamework/core";
import { DataStoreService as Data } from "@rbxts/services";
import { Firebase } from "@rbxts/firebase";
import Signal from "@rbxts/signal";

import type { LogStart } from "shared/hooks";
import type { OnPlayerJoin, OnPlayerLeave } from "server/hooks";
import { Events } from "server/network";
import { Serializers } from "shared/network";
import { LinkRemote } from "server/decorators";
import { LogBenchmark, SpawnTask } from "shared/decorators";
import { roundDecimal } from "shared/utility/numbers";
import { type PlayerData, type GlobalData, INITIAL_DATA } from "shared/data-models/player-data";

export async function getFirebaseInfo(): Promise<[string, string]> {
  return new Promise((resolve, reject) => {
    const env = Data.GetDataStore("EnvironmentInfo");
    try {
      const authKey = env.GetAsync<string>("FIREBASE_AUTH")[0]!;
      const dbUrl = env.GetAsync<string>("FIREBASE_URL")[0]!;

      // Complain if we don't have values to input
      if (authKey === undefined)
        return reject("FIREBASE_AUTH was not found in EnvironmentInfo data store");
      if (dbUrl === undefined)
        return reject("FIREBASE_URL was not found in EnvironmentInfo data store");

      resolve([dbUrl, authKey]);
    } catch (err) {
      reject(`Failed to fetch Firebase info because DataStoreService errored: ${err}`);
    }
  });
}

@Service({ loadOrder: -1 })
export class DataService implements OnInit, OnPlayerJoin, OnPlayerLeave, LogStart {
  public readonly loaded = new Signal<(player: Player, data: PlayerData) => void>;
  public readonly updated = new Signal<(player: Player, data: PlayerData) => void>;
  public readonly updatedGlobal = new Signal<(data: GlobalData) => void>;
  public readonly firebaseCreated = new Signal;
  public playerData: Record<number, PlayerData> = {};

  private firebase!: Firebase;

  @SpawnTask()
  public async onInit(): Promise<void> {
    this.firebase = new Firebase(...await getFirebaseInfo());
    this.firebaseCreated.Fire();
    this.playerData = await this.getDatabase();
  }

  public async onPlayerJoin(player: Player): Promise<void> {
    if (this.firebase === undefined)
      this.firebaseCreated.Wait();

    const data = await this.firebase.get<PlayerData>(`playerData/${player.UserId}`, table.clone(INITIAL_DATA));
    this.playerData[player.UserId] = data;
  }

  public async onPlayerLeave(player: Player): Promise<void> {
    await this.firebase.set(`playerData/${player.UserId}`, this.get(player));
  }

  @LinkRemote(Events.data.initialize)
  @LogBenchmark((_, msElapsed, player) => `Initialized ${player}'s data in ${roundDecimal(msElapsed, 2)} ms`)
  public async setup(player: Player): Promise<void> {
    const data = await this.initialize(player);
    this.loaded.Fire(player, data);
    Events.data.loaded(player, Serializers.playerData.serialize(data));
  }

  public async getGlobal<T>(directory: string, defaultValue?: T): Promise<Maybe<T>> {
    return this.firebase.get(directory, defaultValue);
  }

  public async setGlobal<T>(directory: string, value: T): Promise<void> {
    await this.firebase.set<T>(directory, value);
    this.updatedGlobal.Fire((await this.getGlobal(""))!);
  }

  public async addToArrayGlobal<T extends defined>(directory: string, value: T): Promise<void> {
    await this.firebase.addToArray(directory, value);
    this.updatedGlobal.Fire((await this.getGlobal(""))!);
  }

  public get(player: Player, initialValue = INITIAL_DATA): PlayerData {
    return this.playerData[player.UserId] ?? initialValue;
  }

  public set(player: Player, data: PlayerData): PlayerData {
    this.playerData[player.UserId] = data;
    this.update(player, data);
    return data;
  }

  private async getDatabase(): Promise<Record<string, PlayerData>> {
    if (this.firebase === undefined)
      this.firebaseCreated.Wait();

    return await this.firebase.get("playerData", {});
  }

  @SpawnTask()
  private update(player: Player, data: PlayerData): void {
    this.updated.Fire(player, data);
    Events.data.updated(player, Serializers.playerData.serialize(data));
  }

  private async initialize(player: Player): Promise<PlayerData> {
    const database = await this.getDatabase();
    const data = <Writable<PlayerData>>this.get(player, database[tostring(player.UserId)]);
    for (const [key, value] of pairs(INITIAL_DATA))
      if (!(key in data))
        data[key] = <never>value;

    return this.set(player, data);
  }
}