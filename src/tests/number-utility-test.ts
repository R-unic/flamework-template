import { doubleSidedLimit, roundDecimal, toNearestFiveOrTen, zeroIfClose } from "shared/utility/numbers";
import { Theory, InlineData } from "shared/runit";
import Assert from "shared/runit/assert";

class NumberUtilityTest {
  @Theory()
  @InlineData(69, 10)
  @InlineData(-69, -10)
  public should_limitNumberOnBothSigns(input: number, expected: number) {
    Assert.equal(expected, doubleSidedLimit(input, 10));
  }

  @Theory()
  @InlineData(0.001, 0)
  @InlineData(-0.001, 0)
  @InlineData(0.01, 0.01)
  public should_flattenToZeroIfClose(input: number, expected: number) {
    Assert.equal(expected, zeroIfClose(input))
  }

  @Theory()
  @InlineData(8, 10)
  @InlineData(14, 15)
  @InlineData(18, 20)
  @InlineData(3, 5)
  @InlineData(2, 0)
  public should_roundToNearestFiveOrTen(input: number, expected: number) {
    Assert.equal(expected, toNearestFiveOrTen(input))
  }

  @Theory()
  @InlineData(10.678, 1, 10.7)
  @InlineData(10.678, 2, 10.68)
  public should_roundDecimalPoints(input: number, decimalPoints: number, expected: number) {
    Assert.equal(expected, roundDecimal(input, decimalPoints));
  }
}

export = NumberUtilityTest;