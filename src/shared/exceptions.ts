import { $error } from "rbxts-transform-debug";

export class Exception {
	public constructor(
		name: string,
		public readonly message: string,
		public readonly level?: number
	) {
		throw $error(`${name}Exception: ${message}`, (level ?? 0) + 1);
	}
}

export class FlameworkIgnitionException extends Exception {
	public constructor(public readonly message: string) {
		super("FlameworkIgnition", message);
	}
}
