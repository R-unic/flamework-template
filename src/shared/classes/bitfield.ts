/**
 * Compact method of storing and manipulating individual bits within
 * a data structure
 *
 * Used for efficient storage of boolean flags
 * or integer values.
 *
 * Useful for networking or performance-heavy applications
 */
export default abstract class Bitfield<Mask extends number> {
  /**
   * The number representation
   */
  public flags = <Mask>0;

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
  public setFlag(flag: Mask, value: boolean): void {
    this.flags = <Mask>(value ? this.flags | flag : this.flags & ~flag);
  }

  /**
   * Gets a single-bit wide flag. Also usable for >1 bit wide flags,
   * but will only return true if ALL the bits the mask uses are set
   * @param flag The mask to get the flag from
   * @returns If the flag is set or not
   */
  public getFlag(flag: Mask): boolean {
    return (this.flags & flag) === flag;
  }

  /**
   * Sets a multiple bit wide flag. Also usable for single-bit wide flags
   * @param flag The mask to get the flag from
   * @param value The value to set the flag to
   */
  public setMultibitFlag(flag: Mask, value: number): void {
    const shift = this.calculateShift(flag);
    this.flags = <Mask>(this.flags & ~flag);
    this.flags = <Mask>(this.flags | ((value << shift) & flag));
  }

  /**
   * Sets a multiple bit wide flag. Also usable for single-bit wide flags,
   * but if the value is a boolean it will be returned as a number
   * @param flag The mask to get the flag from
   * @param value The value to set the flag to
   */
  public getMultibitFlag(flag: Mask): number {
    const shift = this.calculateShift(flag);
    return (this.flags & flag) >> shift;
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