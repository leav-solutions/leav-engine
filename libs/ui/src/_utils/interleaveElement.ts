export const interleaveElement = <T extends unknown, U extends unknown>(
    insertedElement: T,
    sourceArray: U[][],
): Array<T | U> => sourceArray.flatMap(arrayElement => [insertedElement, ...arrayElement]).slice(1);
