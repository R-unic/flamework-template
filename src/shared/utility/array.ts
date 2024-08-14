const { max, min, floor, random } = math;

export function randomElement<T extends defined>(array: T[]): T {
  return array[math.random(1, array.size()) - 1];
}

/** Fisher-Yates shuffle algorithm */
export function shuffle<T extends defined>(array: T[]): T[] {
  const shuffledArray = [...array];
  for (let i = shuffledArray.size() - 1; i > 0; i--) {
    const j = floor(random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

export function removeDuplicates<T extends defined>(array: T[]): T[] {
  const seen = new Set<T>();
  return array.filter((value) => {
    if (!seen.has(value)) {
      seen.add(value);
      return true;
    }
    return false;
  });
}

export function flatten<T extends defined>(array: (T | T[])[]): T[] {
  const result: T[] = [];
  for (const value of array) {
    if (typeOf(value) === "table") {
      const flattenedSubtable = flatten(<T[]>value);
      for (const subValue of flattenedSubtable)
        result.push(subValue);
    }
    else
      result.push(<T>value);
  }
  return result;
}

export function reverse<T extends defined>(array: T[]): T[] {
  return array.map((_, i) => array[array.size() - 1 - i]);
}

export function slice<T extends defined>(array: T[], start: number, finish?: number): T[] {
  const length = array.size();
  const startIndex = start < 0 ? max(length + start, 0) : min(start, length);
  const endIndex = finish === undefined ? length : finish < 0 ? max(length + finish, 0) : min(finish, length);

  const slicedArray: T[] = [];
  for (let i = startIndex; i < endIndex; i++)
    slicedArray.push(array[i]);

  return slicedArray;
}