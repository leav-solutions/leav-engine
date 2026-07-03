export const interleaveElement = <T, U>(insertedElement: T, sourceArray: U[][]): Array<T | U> =>
    sourceArray.flatMap(arrayElement => [insertedElement, ...arrayElement]).slice(1);
