import { Service, type OnInit, type OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import Object from "@rbxts/object-utils";
import Signal from "@rbxts/signal";

import type { LogStart } from "shared/hooks";
import type { OnPlayerJoin, OnPlayerLeave } from "server/hooks";
import { Events } from "server/network";
import { Serializers } from "shared/network";
import { type PlayerData, type GlobalData, INITIAL_DATA } from "shared/data-models/player-data";
import Firebase from "server/firebase";
import Log from "shared/logger";

@Service({ loadOrder: -1 })
export class DataService implements OnInit, OnStart, OnPlayerJoin, OnPlayerLeave, LogStart {
	public readonly loaded = new Signal<(player: Player, data: PlayerData) => void>;
	public readonly updated = new Signal<(player: Player, data: PlayerData) => void>;
	public readonly updatedGlobal = new Signal<(data: GlobalData) => void>;
	public readonly firebaseCreated = new Signal;
	public playerData: Record<string, PlayerData> = {};

	private firebase!: Firebase;

	public onInit(): void {
		task.spawn(async () => {
			this.firebase = new Firebase;
			this.firebaseCreated.Fire();
			this.playerData = await this.getDatabase();
		});
	}

	public onStart(): void {
		Events.data.initialize.connect(player => this.setup(player));
	}

	public onPlayerJoin(player: Player): void {
		if (this.firebase === undefined)
			this.firebaseCreated.Wait();

		this.firebase.get<PlayerData>(`playerData/${player.UserId}`, table.clone(INITIAL_DATA))
			.then(data => this.playerData[tostring(player.UserId)] = data);
	}

	public onPlayerLeave(player: Player): void {
		this.firebase.set(`playerData/${player.UserId}`, this.get(player));
	}

	public async getGlobal<T>(directory: string, defaultValue?: T): Promise<T> {
		return this.firebase.get(directory, defaultValue);
	}

	public async setGlobal<T>(directory: string, value: T): Promise<void> {
		const newData = await this.firebase.set<GlobalData>(directory, value);
		this.updatedGlobal.Fire(newData);
	}

	public async addToArrayGlobal<T extends defined>(directory: string, value: T): Promise<void> {
		const newData = await this.firebase.addToArray(directory, value);
		this.updatedGlobal.Fire(newData);
	}

	public get(player: Player, initialValue = INITIAL_DATA): PlayerData {
		return this.playerData[tostring(player.UserId)] ?? initialValue;
	}

	public set(player: Player, data: PlayerData): PlayerData {
		this.playerData[tostring(player.UserId)] = data;
		this.update(player, data);
		return data;
	}

	public async getDatabase(): Promise<Record<string, PlayerData>> {
		return await this.firebase.get("playerData", {});
	}

	private update(player: Player, data: PlayerData): void {
		task.spawn(() => {
			this.updated.Fire(player, data);
			Events.data.updated(player, Serializers.playerData.serialize({ data }));
		});
	}

	private async setup(player: Player): Promise<void> {
		const data = await this.initialize(player);
		this.loaded.Fire(player, data);
		Events.data.loaded(player, Serializers.playerData.serialize({ data }));
		Log.info(`Initialized ${player}'s data`);
	}

	private async initialize(player: Player): Promise<PlayerData> {
		const database = await this.getDatabase();
		const data = this.get(player, database[tostring(player.UserId)]);
		for (const [key, value] of pairs(INITIAL_DATA))
			if (!(key in data))
				(<Writable<PlayerData>>data)[key] = <never>value;

		return this.set(player, data);
	}
}