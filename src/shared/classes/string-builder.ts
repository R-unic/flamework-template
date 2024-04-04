export default class StringBuilder {
  protected indentation = 0;
  private readonly parts: string[] = [];

  /**
   * @param tabSize The amount of spaces a "tab" character will take up
   */
  public constructor(
    private readonly tabSize = 4
  ) {}

  /**
   * All of the parts combined
   */
  protected get generated(): string {
    return this.parts.join("");
  }

  /**
   * Appends pieces of strings onto the current result
   */
  public append(...strings: string[]): void {
    for (const str of strings)
      this.parts.push(str);
  }

  /**
   * Retrieves the last string piece appended
   */
  protected peekLastPart(): string {
    return this.parts[this.parts.size() - 1];
  }

  /**
   * Removes the last string piece appended
   */
  protected popLastPart(): string | undefined {
    return this.parts.pop();
  }

  /**
   * Add indentation for the next lines appended
   */
  protected pushIndentation(): void {
    this.indentation++;
  }

  /**
   * Remove indentation for the next lines appended
   */
  protected popIndentation(): void {
    this.indentation--;
  }

  /**
   * Appends new lines
   * @param amount The amount of new lines to append, defaults to 1
   */
  protected newLine(amount = 1): void {
    this.append(("\n" + " ".rep(this.tabSize).rep(this.indentation)).rep(amount));
  }
}