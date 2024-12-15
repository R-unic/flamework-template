/// <reference types="@rbxts/testez/globals" />
import { doubleSidedLimit, roundDecimal, toNearestFiveOrTen, zeroIfClose } from "shared/utility/numbers";

export = () => {
  describe("number utility", () => {
    it("should limit a number by n on both signs", () => {
      expect(doubleSidedLimit(69, 10)).to.equal(10);
      expect(doubleSidedLimit(-69, 10)).to.equal(-10);
    });
    it("should flatten a number to 0 if close", () => {
      expect(zeroIfClose(0.001)).to.equal(0);
      expect(zeroIfClose(-0.001)).to.equal(0);
      expect(zeroIfClose(0.01)).to.equal(0.01);
    });
    it("should round a number to the nearest 5 or 10", () => {
      expect(toNearestFiveOrTen(8)).to.equal(10);
      expect(toNearestFiveOrTen(14)).to.equal(15);
      expect(toNearestFiveOrTen(18)).to.equal(15);
      expect(toNearestFiveOrTen(3)).to.equal(5);
      expect(toNearestFiveOrTen(2)).to.equal(0);
    });
    it("should round the decimal points of a number", () => {
      expect(roundDecimal(10.678, 1)).to.equal(10.7);
      expect(roundDecimal(10.678, 2)).to.equal(10.68);
    });
  });
};