export default class StringBuilder {
  private buf: buffer;

  /**
   * @param tabSize The amount of spaces a "tab" character will take up
   */
  public constructor(initial?: string) {
    this.buf = initial !== undefined ? buffer.fromstring(initial) : buffer.create(0);
  }

  /**
   * All of the parts combined
   */
  public toString(): string {
    return buffer.tostring(this.buf);
  }

  /**
   * Appends pieces of strings onto the current result
   */
  public append(text: string): void {
    const offset = buffer.len(this.buf);
    this.ensureSize(offset + text.size());
    buffer.writestring(this.buf, offset, text, text.size());
  }

  /**
   * Appends new lines
   * @param amount The amount of new lines to append, defaults to 1
   */
  public appendLine(text: string): void {
    this.append(text + "\n");
  }

  private ensureSize(minimumSize: number): void {
    const bufferSize = buffer.len(this.buf);
    if (minimumSize <= bufferSize) return;

    const newBuf = buffer.create(minimumSize);
    buffer.copy(newBuf, 0, this.buf, 0, bufferSize);
    this.buf = newBuf;
  }
}