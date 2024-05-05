export default class Range {
  public constructor(
    public readonly minimum: number,
    public readonly maximum: number = minimum
  ) { }

  public randomInteger(): number {
    return (new Random).NextInteger(this.minimum, this.maximum);
  }

  public randomNumber(): number {
    return (new Random).NextNumber(this.minimum, this.maximum);
  }

  public numberIsWithin(n: number): boolean {
    return n >= this.minimum && n <= this.maximum;
  }

  public numberIsExclusivelyWithin(n: number): boolean {
    return n > this.minimum && n < this.maximum;
  }
}