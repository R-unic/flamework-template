import Bitfield from "shared/classes/bitfield";

export const enum ExampleMasks {
  Awesome = 0x01, // 1-bit width, binary 0b00001
  NumberValue = 0x0FE, // 7-bit width, binary 0b11111110
  ImTheBestProgrammer = 0x0100 // 1-bit width, binary 100000000
}

export class Example extends Bitfield<ExampleMasks> {
  public constructor() { // this is required sadly
    super();
  }

  protected setDefaults(): void { // these values must be in order of each mask enum member
    this.setMultibitFlag(ExampleMasks.NumberValue, 69); // if i were to add a default value for Awesome then it would need to be before this line
  }
}