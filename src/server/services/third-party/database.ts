import { Service, type OnInit, type OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import Object from "@rbxts/object-utils";
import Signal from "@rbxts/signal";

import type { LogStart } from "shared/hooks";
import type { OnPlayerJoin, OnPlayerLeave } from "server/hooks";
import { Events, Functions } from "server/network";
import { type PlayerData, INITIAL_DATA } from "shared/data-models/player-data";
import Firebase from "server/firebase";
import Log from "shared/logger";

@Service({ loadOrder: 0 })
export class DatabaseService implements OnInit, OnStart, OnPlayerJoin, OnPlayerLeave, LogStart {
	public readonly loaded = new Signal<(player: Player) => void>;
	public readonly updated = new Signal<(player: Player, directory: string, value: unknown) => void>;
	public readonly updatedGlobal = new Signal<(directory: string, value: unknown) => void>;
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
		Events.data.initialize.connect((player) => this.setup(player));
		Events.data.set.connect((player, directory, value) => this.set(player, directory, value));
		Events.data.increment.connect((player, directory, amount) => this.increment(player, directory, amount))
		Functions.data.get.setCallback((player, directory) => this.get(player, directory));
	}

	public onPlayerJoin(player: Player): void {
		if (this.firebase === undefined)
			this.firebaseCreated.Wait();

		this.firebase.get<PlayerData>(`playerData/${player.UserId}`, table.clone(INITIAL_DATA))
			.then(data => this.playerData[tostring(player.UserId)] = data);
	}

	public onPlayerLeave(player: Player): void {
		this.firebase.set(`playerData/${player.UserId}`, this.getCached(player));
	}

	public async getGlobal<T>(directory: string, defaultValue?: T): Promise<T> {
		return this.firebase.get(directory, defaultValue);
	}

	public async setGlobal<T>(directory: string, value: T): Promise<void> {
		await this.firebase.set(directory, value);
		this.updatedGlobal.Fire(directory, value);
	}

	public async addToArrayGlobal<T extends defined>(directory: string, value: T): Promise<void> {
		await this.firebase.addToArray(directory, value);
		this.updatedGlobal.Fire(directory, value);
	}

	public get<T>(player: Player, directory: string, defaultValue?: T): T {
		let data = this.getCached(player);
		if (directory === "") return <T>data;

		const pieces = directory.split("/");
		let result = <T>data;
		for (const piece of pieces) {
			if (result === undefined) continue;
			result = (<Record<string, T>>result)[piece];
		}

		return <T>result ?? defaultValue!;
	}

	public set<T>(player: Player, directory: string, value: T): void {
		let data: Record<string, unknown> = this.getCached(player);
		const pieces = directory.split("/");
		const lastPiece = pieces.pop()!;

		for (const piece of pieces) {
			if (data[piece] === undefined)
				data[piece] = {};

			data = <Record<string, unknown>>data[piece];
		}

		data[lastPiece] = value;
		this.update(player, this.getDirectoryForPlayer(player, directory), value);
	}

	public addToArray<T extends defined>(player: Player, directory: string, value: T): void {
		const array = this.get<T[]>(player, directory, []);
		array.push(value);
		this.set(player, directory, array);
	}

	public increment(player: Player, directory: string, amount = 1): number {
		const oldValue = this.get<number>(player, directory, 0);
		const value = oldValue + amount;
		this.set(player, directory, value);
		return value;
	}

	public decrement(player: Player, directory: string, amount = 1): number {
		return this.increment(player, directory, -amount);
	}

	public delete(player: Player, directory: string): void {
		this.set(player, directory, undefined);
	}

	public getPlayerFromDirectory(directory: string): Player {
		const [_, piece] = directory.split("playerData/");
		const userID = tonumber(piece?.split("/")[0])!;
		return Players.GetPlayerByUserId(userID)!;
	}

	public async getDatabase(): Promise<Record<string, PlayerData>> {
		return await this.firebase.get("playerData", {});
	}

	private getCached(player: Player): PlayerData {
		return this.playerData[tostring(player.UserId)] ?? INITIAL_DATA;
	}

	private update(player: Player, fullDirectory: string, value: unknown): void {
		task.spawn(() => {
			this.updated.Fire(player, fullDirectory, value);
			Events.data.updated(player, fullDirectory, value);
		});
	}

	private async setup(player: Player): Promise<void> {
		await this.initializeAll(player);
		this.loaded.Fire(player);
		Log.info(`Initialized ${player}'s data`);
	}

	private async initializeAll(player: Player, data: Record<string, unknown> = INITIAL_DATA): Promise<void> {
		for (const [key, value] of Object.entries(data)) {
			if (typeOf(key) === "number") continue;

			await this.initialize(player, key, value);
			if (typeOf(value) === "table")
				await this.initializeAll(player, value);
		}
	}

	private async initialize<T>(player: Player, directory: string, initialValue: T): Promise<void> {
		await this.set(player, directory, this.get(player, directory, initialValue));
	}

	private getDirectoryForPlayer(player: Player, directory: string): string {
		return `playerData/${player.UserId}/${directory}`;
	}
}