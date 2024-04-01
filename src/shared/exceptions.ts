export class Exception {
	public constructor(
		name: string,
		public readonly message: string,
		public readonly level?: number
	) {
		warn(`${name}Exception: ${message}`);
	}
}

export class FlameworkIgnitionException extends Exception {
	public constructor(public readonly message: string) {
		super("FlameworkIgnition", message);
	}
}

export class MissingAttributeException extends Exception {
	public constructor(instance: Instance, attributeName: string) {
		super("MissingAttribute", `${instance.ClassName} "${instance.Name}" is missing attribute "${attributeName}"`);
	}
}