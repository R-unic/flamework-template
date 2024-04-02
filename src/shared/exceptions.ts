import Log from "./logger";

export class Exception {
	public constructor(
		name: string,
		public readonly message: string,
		public readonly level?: number
	) {
		Log.fatal(`${name}Exception: ${message}`);
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

export class HttpException extends Exception {
	public constructor(message: string) {
		super("Http", message);
	}
}

export class MissingEnvValueException extends Exception {
	public constructor(valueName: string) {
		super("MissingEnvValue", `"${valueName}" was not found in .env file`);
	}
}