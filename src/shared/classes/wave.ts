export default class Wave {
  public constructor(
    public amplitude: number = 1,
    public frequency: number = 1,
    public phaseShift: number = 0,
    public verticalShift: number = 0,
    public waveFunction: (n: number) => number = math.sin
  ) {}

  public update(dt: number, damping = 1): number {
    return ((this.amplitude * this.waveFunction(this.frequency * os.clock() + this.phaseShift) + this.verticalShift) * dt) / damping;
  }
}