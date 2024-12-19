import { toSpaced, capitalize, slugToPascal, stripWhitespace } from "shared/utility/strings";
import { Fact, Theory, InlineData } from "shared/runit";
import Assert from "shared/runit/assert";

class StringUtilityTest {
  @Theory()
  @InlineData("hey-guys", "HeyGuys")
  @InlineData("abc-123", "Abc123")
  public should_convertSlugToPascal(input: string, expected: string): void {
    const pascal = slugToPascal(input);
    Assert.equal(expected, pascal);
  }

  @Theory()
  @InlineData("hey Guys", "hey Guys")
  @InlineData("LaLa123", "La La 123")
  public should_convertToSpacedText(input: string, expected: string): void {
    const pascal = toSpaced(input);
    Assert.equal(expected, pascal);
  }

  @Fact()
  public should_capitalizeFirstLetter(): void {
    const capitalized = capitalize("hey guys");
    Assert.equal("Hey guys", capitalized);
  }

  @Fact()
  public should_removeAllWhitespace(): void {
    const stripped = stripWhitespace("   hello chat ");
    Assert.equal("hellochat", stripped);
  }
}

export = StringUtilityTest;