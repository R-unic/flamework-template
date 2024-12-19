import { Fact, Theory, InlineData, Assert } from "@rbxts/runit";

import { toSpaced, capitalize, slugToPascal, stripWhitespace } from "shared/utility/strings";

class StringUtilityTest {
  @Theory()
  @InlineData("hey-guys", "HeyGuys")
  @InlineData("abc-123", "Abc123")
  public convertsSlugToPascal(input: string, expected: string): void {
    const pascal = slugToPascal(input);
    Assert.equal(expected, pascal);
  }

  @Theory()
  @InlineData("hey Guys", "hey Guys")
  @InlineData("LaLa123", "La La 123")
  public convertsToSpacedText(input: string, expected: string): void {
    const pascal = toSpaced(input);
    Assert.equal(expected, pascal);
  }

  @Fact()
  public capitalizesFirstLetter(): void {
    const capitalized = capitalize("hey guys");
    Assert.equal("Hey guys", capitalized);
  }

  @Fact()
  public removesAllWhitespace(): void {
    const stripped = stripWhitespace("   hello chat ");
    Assert.equal("hellochat", stripped);
  }
}

export = StringUtilityTest;