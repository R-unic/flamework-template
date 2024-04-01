import { type OnInit, type OnStart, Service } from "@flamework/core";
import { Players } from "@rbxts/services";
import Signal from "@rbxts/signal";

import { Events, Functions } from "server/network";
import Firebase from "./firebase";
import Log from "shared/logger";

import type { LogStart } from "shared/hooks";
import Object from "@rbxts/object-utils";

const PlayerData = Firebase.fetch("playerData");

@Service()
export class DatabaseService implements OnInit, OnStart, LogStart {
	public readonly loaded = new Signal<(player: Player) => void>;
	public readonly updated = new Signal<<T = unknown>(directory: string, value: T) => void>;

	public onInit(): void {
		Events.data.initialize.connect((player) => this.setup(player));
		Events.data.set.connect((player, key, value) => this.set(player, key, value));
		Events.data.increment.connect((player, key, amount) => this.increment(player, key, amount))
		Functions.data.get.setCallback((player, key) => this.get(player, key));
	}

	public onStart(): void {
		const allPlayerData = PlayerData.get<Record<string, object>>("") ?? {};
		for (const [userID, playerData] of Object.entries(allPlayerData)) {
			const player = Players.GetPlayerByUserId(tonumber(userID)!);
			if (!player) continue;
			for (const [key, value] of Object.entries(playerData))
				this.update(player, `${userID}/${key}`, value);
		}
	}

	public get<T>(player: Player, directory: string, defaultValue?: T): T {
		const fullDirectory = this.getDirectoryForPlayer(player, directory);
		return PlayerData.get(fullDirectory) ?? <T>defaultValue;
	}

	public set<T>(player: Player, directory: string, value: T): void {
		const fullDirectory = this.getDirectoryForPlayer(player, directory);
		this.update(player, fullDirectory, value);
	}

	public increment(player: Player, directory: string, amount = 1): number {
		const fullDirectory = this.getDirectoryForPlayer(player, directory);
		return PlayerData.increment(fullDirectory, amount);
	}

	public delete(player: Player, directory: string): void {
		const fullDirectory = this.getDirectoryForPlayer(player, directory);
		return PlayerData.delete(fullDirectory);
	}

	private update(player: Player, fullDirectory: string, value: unknown) {
		PlayerData.set(fullDirectory, value);
		Events.data.updated(player, fullDirectory, value);
	}

	private setup(player: Player): void {
		// Initialize your values here.
    // e.x. this.initialize(player, "playtime", 0);
		this.loaded.Fire(player);
		Log.info("Initialized data");
	}

	private initialize<T>(player: Player, directory: string, initialValue: T): void {
		const fullDirectory = this.getDirectoryForPlayer(player, directory);
		const value = PlayerData.get<Maybe<T>>(fullDirectory) ?? initialValue;
		this.set(player, directory, value);
	}

	private getDirectoryForPlayer(player: Player, directory: string): string {
		return `${player.UserId}/${directory}`;
	}
}