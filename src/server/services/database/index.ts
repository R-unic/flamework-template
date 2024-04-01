import { type OnInit, Service } from "@flamework/core";
import Signal from "@rbxts/signal";

import { Events, Functions } from "server/network";
import Firebase from "server/firebase";
import Log from "shared/logger";

import type { LogStart } from "shared/hooks";

const db = new Firebase;

@Service()
export class DatabaseService implements OnInit, LogStart {
	public readonly loaded = new Signal<(player: Player) => void>;
	public readonly updated = new Signal<<T = unknown>(directory: string, value: T) => void>;

	public onInit(): void {
		Events.data.initialize.connect((player) => this.setup(player));
		Events.data.set.connect((player, key, value) => this.set(player, key, value));
		Events.data.increment.connect((player, key, amount) => this.increment(player, key, amount))
		Functions.data.get.setCallback((player, key) => this.get(player, key));
	}

	public get<T>(player: Player, directory: string, defaultValue?: T): T {
		const fullDirectory = this.getDirectoryForPlayer(player, directory);
		return db.get(fullDirectory) ?? <T>defaultValue;
	}

	public set<T>(player: Player, directory: string, value: T): void {
		const fullDirectory = this.getDirectoryForPlayer(player, directory);
		db.set(fullDirectory, value);
		this.update(player, fullDirectory, value);
	}

	public increment(player: Player, directory: string, amount = 1): number {
		const fullDirectory = this.getDirectoryForPlayer(player, directory);
		const value = db.increment(fullDirectory, amount);
		this.update(player, fullDirectory, value);

		return value;
	}

	public delete(player: Player, directory: string): void {
		const fullDirectory = this.getDirectoryForPlayer(player, directory);
		db.delete(fullDirectory);
		this.update(player, fullDirectory, undefined);
	}

	private update(player: Player, fullDirectory: string, value: unknown): void {
		this.updated.Fire(fullDirectory, value);
		Events.data.updated(player, fullDirectory, value);
	}

	private setup(player: Player): void {
		// Initialize your values here.
    // e.x. this.initialize(player, "playtime", 0);
		this.initialize(player, "playtime", 0);
		this.loaded.Fire(player);
		Log.info("Initialized data");
	}

	private initialize<T>(player: Player, directory: string, initialValue: T): void {
		const fullDirectory = this.getDirectoryForPlayer(player, directory);
		const value = db.get<Maybe<T>>(fullDirectory) ?? initialValue;
		this.set(player, directory, value);
	}

	private getDirectoryForPlayer(player: Player, directory: string): string {
		return `${player.UserId}/${directory}`;
	}
}