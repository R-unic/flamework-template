import Log from "./logger";

export class FlameworkIgnitionException extends Log.Exception {
	public constructor(public readonly message: string) {
		super("FlameworkIgnition", message);
	}
}

export class MissingAttributeException extends Log.Exception {
	public constructor(instance: Instance, attributeName: string) {
		super("MissingAttribute", `${instance.ClassName} "${instance.Name}" is missing attribute "${attributeName}"`);
	}
}

export class HttpException extends Log.Exception {
	public constructor(message: string) {
		super("Http", message);
	}
}

export class MissingEnvValueException extends Log.Exception {
	public constructor(valueName: string) {
		super("MissingEnvValue", `"${valueName}" was not found in .env file`);
	}
}