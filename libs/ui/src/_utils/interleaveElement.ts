// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export const interleaveElement = <T extends unknown, U extends unknown>(
    insertedElement: T,
    sourceArray: U[][]
): Array<T | U> => sourceArray.flatMap(arrayElement => [insertedElement, ...arrayElement]).slice(1);
