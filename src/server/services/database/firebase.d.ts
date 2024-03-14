interface Headers {
  [name: string]: string;
}

interface FirebaseService {
  /**
   * Sets whether Firebase's data can be updated from server. Data can still be read from realtime Database regardless.
   * @param use bool Using Firebase
   */
  useFirebase(use: boolean): void;
  /**
   * Sets whether Firebase's data can be updated from server. Data can still be read from realtime Database regardless.
   * @param name Given name of a JSON Object in the Realtime Database.
   * @param scope Optional scope.
   * @returns Firebase database
   */
  fetch(dataKey: string, database?: string): Firebase;
}

interface Firebase {
  /**
   * A method to get a datastore with the same name and scope.
	 * @returns Roblox GlobalDataStore representing the Firebase database.
   */
  getDatastore(): GlobalDataStore;
  /**
   * Returns the value of the entry in the database JSON Object with the given key.
	 * @param directory Directory of the value that you are look for. E.g. "PlayerSaves" or "PlayerSaves/Stats".
	 * @returns Value associated with directory.
   */
  get<T>(directory: string): T;
  /**
   * Sets the value of the key. This overwrites any existing data stored in the key.
	 * @param directory Directory of the value that you are look for. E.g. "PlayerSaves" or "PlayerSaves/Stats".
	 * @param value Value can be any basic data types. It's recommened you HttpService:JSONEncode() your values before passing it through.
	 * @param headers Optional HTTPRequest Header overwrite. Default is {["X-HTTP-Method-Override"]="PUT"}.
   */
  set<T>(directory: string, value: T, headers?: Headers): void;
  /**'
   * Increments the value of a particular key and returns the incremented value.
	 * @param directory Directory of the value that you are look for. E.g. "PlayerSaves" or "PlayerSaves/Stats".
	 * @param delta The amount to increment by.
   * @returns The new incremented value
   */
  increment(directory: string, delta: number): number;
  /**
   * Removes the given key from the data store and returns the value associated with that key.
	 * @param directory Directory of the value that you are look for. E.g. "PlayerSaves" or "PlayerSaves/Stats".
   */
  delete(directory: string): void;
  /**
   * Retrieves the value of a key from a data store and updates it with a new value.
	 * @param directory Directory of the value that you are look for. E.g. "PlayerSaves" or "PlayerSaves/Stats".
	 * @param callback Works similarly to Roblox's GlobalDatastore:UpdateAsync().
   */
  update<T>(directory: string, callback: (currentData: T) => T): void;
}

declare const Firebase: FirebaseService;
export = Firebase;