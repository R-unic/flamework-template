export interface LogStart { }

export interface OnCharacterAdd<Character extends CharacterModel = CharacterModel> {
  onCharacterAdd(character: Character): void;
}

export interface OnCharacterRemove<Character extends CharacterModel = CharacterModel> {
  onCharacterRemove(character: Character): void;
}