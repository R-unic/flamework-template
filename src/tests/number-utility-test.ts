import { Theory, InlineData, Assert } from "@rbxts/runit";

import { doubleSidedLimit, roundDecimal, toNearestFiveOrTen, zeroIfClose } from "shared/utility/numbers";

class NumberUtilityTest {
  @Theory()
  @InlineData(69, 10)
  @InlineData(-69, -10)
  public limitsNumberOnBothSigns(input: number, expected: number): void {
    Assert.equal(expected, doubleSidedLimit(input, 10));
  }

  @Theory()
  @InlineData(0.001, 0)
  @InlineData(-0.001, 0)
  @InlineData(0.01, 0.01)
  public flattensToZeroIfClose(input: number, expected: number): void {
    Assert.equal(expected, zeroIfClose(input))
  }

  @Theory()
  @InlineData(8, 10)
  @InlineData(14, 15)
  @InlineData(18, 20)
  @InlineData(3, 5)
  @InlineData(2, 0)
  public roundsToNearestFiveOrTen(input: number, expected: number): void {
    Assert.equal(expected, toNearestFiveOrTen(input))
  }

  @Theory()
  @InlineData(10.678, 1, 10.7)
  @InlineData(10.678, 2, 10.68)
  public roundsDecimalPoints(input: number, decimalPoints: number, expected: number): void {
    Assert.equal(expected, roundDecimal(input, decimalPoints));
  }
}

export = NumberUtilityTest;