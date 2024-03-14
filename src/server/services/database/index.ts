import { OnInit, Service } from "@flamework/core";
import Signal from "@rbxts/signal";

import { DataValue } from "shared/data-models/generic";
import { Events, Functions } from "server/network";
import Firebase from "./firebase";
import Log from "shared/logger";

import type { LogStart } from "shared/hooks";

const PlayerData = Firebase.fetch("playerData");

@Service()
export class DatabaseService implements OnInit, LogStart {
	public readonly loaded = new Signal<(player: Player) => void>;

	public onInit(): void {
		Events.data.initialize.connect((player) => this.setup(player));
		Events.data.set.connect((player, key, value) => this.set(player, key, value));
		Events.data.increment.connect((player, key, amount) => this.increment(player, key, amount))
		Functions.data.get.setCallback((player, key) => this.get(player, key));
	}

	public get<T extends DataValue>(player: Player, directory: string): T {
		const fullDirectory = this.getDirectoryForPlayer(player, directory);
		return PlayerData.get(fullDirectory);
	}

	public set<T extends DataValue>(player: Player, directory: string, value: T): void {
		const fullDirectory = this.getDirectoryForPlayer(player, directory);
		PlayerData.set(fullDirectory, value);
		Events.data.updated(player, fullDirectory, value);
	}

	public increment(player: Player, directory: string, amount = 1): number {
		const fullDirectory = this.getDirectoryForPlayer(player, directory);
		return PlayerData.increment(fullDirectory, amount);
	}

	public delete(player: Player, directory: string): void {
		const fullDirectory = this.getDirectoryForPlayer(player, directory);
		return PlayerData.delete(fullDirectory);
	}

	private setup(player: Player): void {
    this.initialize(player, "playtime", 0);
		this.loaded.Fire(player);
		Log.info("Initialized data");
	}

	private initialize<T extends DataValue>(player: Player, directory: string, initialValue: T): void {
		const fullDirectory = this.getDirectoryForPlayer(player, directory);
		const value = PlayerData.get<Maybe<T>>(fullDirectory) ?? initialValue;
		this.set(player, directory, value);
	}

	private getDirectoryForPlayer(player: Player, directory: string): string {
		return `${player.UserId}/${directory}`;
	}
}