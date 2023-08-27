export interface GameDataModel {
  // put all of your data fields and types here
  // for example:
  gold: number;
  gems: number;
}

export type DataValue = GameDataModel[DataKey];
export type DataKey = keyof GameDataModel;

export const DataKeys: DataKey[] = [
  // put all of the keys for your data here
  // using the last example's data, you would write:
  "gold", "gems"
];