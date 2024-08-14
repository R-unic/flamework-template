import { HttpService as HTTP, DataStoreService as Data } from "@rbxts/services";
import { endsWith, slice } from "@rbxts/string-utils";
import Object from "@rbxts/object-utils";

import Log from "shared/logger";

const env = Data.GetDataStore("EnvironmentInfo");

export default class Firebase {
  private readonly authKey!: string;
  private readonly dbUrl!: string;
  private readonly authQuery!: string;
  private readonly baseURL!: string;

  public constructor() {
    try {
      this.authKey = <string>env.GetAsync<string>("FIREBASE_AUTH")[0];
      this.dbUrl = <string>env.GetAsync<string>("FIREBASE_URL")[0];
      this.authQuery = `.json?auth=${this.authKey}`;
      this.baseURL = this.fixPath(this.dbUrl) + "/";

      // Complain if we don't have values to input
      if (this.authKey === undefined)
        Log.fatal("FIREBASE_AUTH was not found in EnvironmentInfo data store");
      if (this.dbUrl === undefined)
        Log.fatal("FIREBASE_URL was not found in EnvironmentInfo data store");
    } catch (err) {
      Log.fatal(`DataStoreService is trash: ${err}`);
    }
  }

  public async set(path?: string, value?: unknown, headers: Record<string, string> = { "X-HTTP-Method-Override": "PUT" }): Promise<void> {
    const valueIsObject = typeOf(value) === "table" && value !== undefined;
    const valueIsEmptyArray = valueIsObject && "size" in <object>value && (<Array<defined>>value).size() === 0;
    const valueIsEmptyObject = valueIsObject && Object.entries(value!).size() === 0;
    if (valueIsEmptyArray || valueIsEmptyObject)
      return await this.delete(path);

    return new Promise((resolve, reject) => {
      try {
        HTTP.PostAsync(
          this.getEndpoint(path),
          HTTP.JSONEncode(value),
          "ApplicationJson",
          false, headers
        );
        resolve();
      } catch (error) {
        reject(`[Firebase]: ${error}`);
      }
    });
  }

  public async get<T>(path?: string, defaultValue?: T): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        const res = HTTP.GetAsync(this.getEndpoint(path), true);
        resolve(<T>HTTP.JSONDecode(res) ?? defaultValue!);
      } catch (error) {
        reject(`[Firebase]: ${error}`);
      }
    });
  }

  public async delete(path?: string): Promise<void> {
    await this.set(path, undefined, { "X-HTTP-Method-Override": "DELETE" });
  }

  public async reset(): Promise<void> {
    await this.delete("");
  }

  public async increment(path?: string, delta = 1): Promise<number> {
    const result = await this.get<number>(path) + delta;
    await this.set(path, result);
    return result;
  }

  public async addToArray<T extends defined>(path: string, value: T, maxArraySize?: number): Promise<void> {
    const data = await this.get<T[]>(path, []);
    if (maxArraySize !== undefined)
      if (data.size() >= maxArraySize) {
        const diff = data.size() - maxArraySize;
        for (let i = 0; i < diff + 1; i++)
          data.shift();
      }

    data.push(value);
    await this.set(path, data);
  }

  private getEndpoint(path?: string): string {
    path = this.fixPath(path);
    return this.baseURL + HTTP.UrlEncode(path === undefined ? "" : `/${path}`) + this.authQuery;
  }

  private fixPath(path?: string): string {
    if (path === undefined) return "";
    path = this.removeExtraSlash(path);
    return path;
  }

  private removeExtraSlash(path: string): string {
    if (endsWith(path, "/"))
      path = slice(path, 0, -1);

    return endsWith(path, "/") ? this.removeExtraSlash(path) : path;
  }
}