/// <reference types="@rbxts/testez/globals" />
import { toSpaced, capitalize, slugToPascal, removeWhitespace as stripWhitespace } from "shared/utility/strings";

export = () => {
  describe("string utility", () => {
    it("should convert slug-case to PascalCase", () => {
      expect(slugToPascal("hey-guys")).to.equal("HeyGuys");
    });
    it("should convert to spaced text", () => {
      expect(toSpaced("heyGuys")).to.equal("hey Guys");
      expect(toSpaced("LaLa123")).to.equal("La La 123");
    });
    it("should capitalize the first letter", () => {
      expect(capitalize("hey guys")).to.equal("Hey guys");
    });
    it("should remove all whitespace", () => {
      expect(stripWhitespace(" hello chat ")).to.equal("hellochat");
    });
  });
};