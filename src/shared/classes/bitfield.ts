/**
 * Compact method of storing and manipulating individual bits within a data structure
 *
 * Used for efficient storage of boolean flags or integer values.
 *
 * Useful for optimizations
 */
export default abstract class Bitfield<Mask extends number> {
  /**
   * The number representation
   */
  public field = <Mask>0;

  /**
   * These values must be in order of each mask enum member
   */
  protected abstract setDefaults(): void;

  protected constructor() {
    this.setDefaults();
  }

  /**
   * Sets a single-bit wide flag
   * @param flag The mask to get the flag from
   * @param value The value to set the flag to
   */
  public set(flag: Mask, value: boolean): void {
    this.field = <Mask>(value ? this.field | flag : this.field & ~flag);
  }

  /**
   * Gets a single-bit wide boolean flag. Also usable for >1 bit wide flags,
   * but will only return true if ALL the bits the mask uses are set
   * @param flag The mask to get the flag from
   * @returns If the flag is set or not
   */
  public get(flag: Mask): boolean {
    return (this.field & flag) === flag;
  }

  /**
   * Sets a multiple bit wide flag. Also usable for single-bit wide flags
   * @param flag The mask to get the flag from
   * @param value The value to set the flag to
   */
  public setMultibit(flag: Mask, value: number): void {
    const shift = this.calculateShift(flag);
    this.field = <Mask>(this.field & ~flag);
    this.field = <Mask>(this.field | ((value << shift) & flag));
  }

  /**
   * Sets a multiple bit wide flag. Also usable for single-bit wide flags,
   * but if the value is a boolean it will be returned as a number
   * @param flag The mask to get the flag from
   * @param value The value to set the flag to
   */
  public getMultibit(flag: Mask): number {
    const shift = this.calculateShift(flag);
    return (this.field & flag) >> shift;
  }

  private calculateShift(mask: number): number {
    let shift = 0;
    while ((mask & 1) === 0 && mask !== 0) {
      shift++;
      mask >>= 1; // why is this red lol
    }
    return shift;
  }
}