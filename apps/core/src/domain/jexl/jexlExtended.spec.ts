// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import jexl from './jexlExtended';

describe('jexlExtended', () => {
    beforeAll(() => {
        // Async helpers to simulate real async evaluation in expressions
        jexl.addFunction('asyncDouble', (x: number) => Promise.resolve(x * 2));
        jexl.addFunction('asyncGt', (x: number, threshold: number) => Promise.resolve(x > threshold));
        jexl.addFunction('asyncNegate', (x: number) => Promise.resolve(-x));
    });

    describe('map', () => {
        test('maps values with a sync expression', async () => {
            const result = await jexl.eval('map(items, "value * 2")', {items: [1, 2, 3]});
            expect(result).toEqual([2, 4, 6]);
        });

        test('exposes index and array in expression context', async () => {
            const result = await jexl.eval('map(items, "index")', {items: ['a', 'b', 'c']});
            expect(result).toEqual([0, 1, 2]);
        });

        test('returns undefined for non-array input', async () => {
            const result = await jexl.eval('map(notArray, "value")', {notArray: 'hello'});
            expect(result).toBeUndefined();
        });

        test('handles async expression evaluation', async () => {
            const result = await jexl.eval('map(items, "asyncDouble(value)")', {items: [1, 2, 3]});
            expect(result).toEqual([2, 4, 6]);
        });

        test('works as a transform', async () => {
            const result = await jexl.eval('items|map("value * 3")', {items: [1, 2, 3]});
            expect(result).toEqual([3, 6, 9]);
        });

        test('handles async expression as a transform', async () => {
            const result = await jexl.eval('items|map("asyncDouble(value)")', {items: [10, 20]});
            expect(result).toEqual([20, 40]);
        });
    });

    describe('filter', () => {
        test('filters values with a sync expression', async () => {
            const result = await jexl.eval('filter(items, "value > 2")', {items: [1, 2, 3, 4, 5]});
            expect(result).toEqual([3, 4, 5]);
        });

        test('returns empty array for non-array input', async () => {
            const result = await jexl.eval('filter(notArray, "value > 0")', {notArray: 'hello'});
            expect(result).toEqual([]);
        });

        test('handles async expression evaluation', async () => {
            const result = await jexl.eval('filter(items, "asyncGt(value, 2)")', {items: [1, 2, 3, 4, 5]});
            expect(result).toEqual([3, 4, 5]);
        });

        test('works as a transform', async () => {
            const result = await jexl.eval('items|filter("value % 2 == 0")', {items: [1, 2, 3, 4, 5, 6]});
            expect(result).toEqual([2, 4, 6]);
        });

        test('handles async expression as a transform', async () => {
            const result = await jexl.eval('items|filter("asyncGt(value, 3)")', {items: [1, 2, 3, 4, 5]});
            expect(result).toEqual([4, 5]);
        });
    });

    describe('first', () => {
        test('returns first element', async () => {
            const result = await jexl.eval('first(items)', {items: [10, 20, 30]});
            expect(result).toBe(10);
        });

        test('returns null for empty array', async () => {
            const result = await jexl.eval('first(items)', {items: []});
            expect(result).toBeNull();
        });

        test('returns null for non-array input', async () => {
            const result = await jexl.eval('first(notArray)', {notArray: 'hello'});
            expect(result).toBeNull();
        });

        test('works as a transform', async () => {
            const result = await jexl.eval('items|first', {items: [42, 99]});
            expect(result).toBe(42);
        });
    });

    describe('last', () => {
        test('returns last element', async () => {
            const result = await jexl.eval('last(items)', {items: [10, 20, 30]});
            expect(result).toBe(30);
        });

        test('returns null for empty array', async () => {
            const result = await jexl.eval('last(items)', {items: []});
            expect(result).toBeNull();
        });

        test('returns null for non-array input', async () => {
            const result = await jexl.eval('last(notArray)', {notArray: 'hello'});
            expect(result).toBeNull();
        });

        test('works as a transform', async () => {
            const result = await jexl.eval('items|last', {items: [42, 99]});
            expect(result).toBe(99);
        });
    });

    describe('flatten', () => {
        test('flattens nested arrays', async () => {
            const result = await jexl.eval('flatten(items)', {items: [1, [2, [3, 4], 5], 6]});
            expect(result).toEqual([1, 2, 3, 4, 5, 6]);
        });

        test('returns empty array for non-array input', async () => {
            const result = await jexl.eval('flatten(notArray)', {notArray: 'hello'});
            expect(result).toEqual([]);
        });

        test('works as a transform', async () => {
            const result = await jexl.eval('items|flatten', {items: [[1, 2], [3, 4], [5]]});
            expect(result).toEqual([1, 2, 3, 4, 5]);
        });
    });

    describe('sort / order', () => {
        const people = [
            {name: 'Charlie', age: 30},
            {name: 'Alice', age: 25},
            {name: 'Bob', age: 35},
        ];

        test('sorts without expression (natural sort)', async () => {
            const result = await jexl.eval('sort(items)', {items: [3, 1, 2]});
            expect(result).toEqual([1, 2, 3]);
        });

        test('sorts by property ascending', async () => {
            const result = await jexl.eval('sort(items, "age")', {items: people});
            expect(result).toEqual([
                {name: 'Alice', age: 25},
                {name: 'Charlie', age: 30},
                {name: 'Bob', age: 35},
            ]);
        });

        test('sorts by property descending', async () => {
            const result = await jexl.eval('sort(items, "age", true)', {items: people});
            expect(result).toEqual([
                {name: 'Bob', age: 35},
                {name: 'Charlie', age: 30},
                {name: 'Alice', age: 25},
            ]);
        });

        test('returns empty array for non-array input', async () => {
            const result = await jexl.eval('sort(notArray, "age")', {notArray: 'hello'});
            expect(result).toEqual([]);
        });

        test('handles async sort key expression', async () => {
            // asyncNegate(age) as key → sorts by negated age → effectively descending
            const result = await jexl.eval('sort(items, "asyncNegate(age)")', {items: people});
            expect(result).toEqual([
                {name: 'Bob', age: 35},
                {name: 'Charlie', age: 30},
                {name: 'Alice', age: 25},
            ]);
        });

        test('works as a transform', async () => {
            const result = await jexl.eval('items|sort("name")', {items: people});
            expect(result).toEqual([
                {name: 'Alice', age: 25},
                {name: 'Bob', age: 35},
                {name: 'Charlie', age: 30},
            ]);
        });

        test('works as a transform with async key', async () => {
            const result = await jexl.eval('items|sort("asyncNegate(age)")', {items: people});
            expect(result).toEqual([
                {name: 'Bob', age: 35},
                {name: 'Charlie', age: 30},
                {name: 'Alice', age: 25},
            ]);
        });
    });

    describe('any / some', () => {
        test('returns true when at least one value matches', async () => {
            const result = await jexl.eval('any(items, "value > 4")', {items: [1, 2, 3, 4, 5]});
            expect(result).toBe(true);
        });

        test('returns false when no value matches', async () => {
            const result = await jexl.eval('any(items, "value > 10")', {items: [1, 2, 3]});
            expect(result).toBe(false);
        });

        test('returns false for non-array input', async () => {
            const result = await jexl.eval('any(notArray, "value > 0")', {notArray: 'hello'});
            expect(result).toBe(false);
        });

        test('handles async expression evaluation', async () => {
            const result = await jexl.eval('any(items, "asyncGt(value, 4)")', {items: [1, 2, 3, 4, 5]});
            expect(result).toBe(true);
        });

        test('works as a transform', async () => {
            const result = await jexl.eval('items|any("asyncGt(value, 10)")', {items: [1, 2, 3]});
            expect(result).toBe(false);
        });
    });

    describe('all / every', () => {
        test('returns true when all values match', async () => {
            const result = await jexl.eval('all(items, "value > 0")', {items: [1, 2, 3]});
            expect(result).toBe(true);
        });

        test('returns false when at least one value does not match', async () => {
            const result = await jexl.eval('all(items, "value > 2")', {items: [1, 2, 3]});
            expect(result).toBe(false);
        });

        test('returns false for non-array input', async () => {
            const result = await jexl.eval('all(notArray, "value > 0")', {notArray: 'hello'});
            expect(result).toBe(false);
        });

        test('handles async expression evaluation', async () => {
            const result = await jexl.eval('every(items, "asyncGt(value, 0)")', {items: [1, 2, 3]});
            expect(result).toBe(true);
        });

        test('works as a transform', async () => {
            const result = await jexl.eval('items|every("asyncGt(value, 0)")', {items: [1, 2, -1]});
            expect(result).toBe(false);
        });
    });

    describe('find', () => {
        test('returns first matching value', async () => {
            const result = await jexl.eval('find(items, "value > 2")', {items: [1, 2, 3, 4]});
            expect(result).toBe(3);
        });

        test('returns undefined when no value matches', async () => {
            const result = await jexl.eval('find(items, "value > 10")', {items: [1, 2, 3]});
            expect(result).toBeUndefined();
        });

        test('returns undefined for non-array input', async () => {
            const result = await jexl.eval('find(notArray, "value > 0")', {notArray: 'hello'});
            expect(result).toBeUndefined();
        });

        test('handles async expression evaluation', async () => {
            const result = await jexl.eval('find(items, "asyncGt(value, 2)")', {items: [1, 2, 3, 4]});
            expect(result).toBe(3);
        });

        test('works as a transform', async () => {
            const result = await jexl.eval('items|find("asyncGt(value, 3)")', {items: [1, 2, 3, 4, 5]});
            expect(result).toBe(4);
        });
    });

    describe('findIndex', () => {
        test('returns index of first matching value', async () => {
            const result = await jexl.eval('findIndex(items, "value > 2")', {items: [1, 2, 3, 4]});
            expect(result).toBe(2);
        });

        test('returns -1 when no value matches', async () => {
            const result = await jexl.eval('findIndex(items, "value > 10")', {items: [1, 2, 3]});
            expect(result).toBe(-1);
        });

        test('returns undefined for non-array input', async () => {
            const result = await jexl.eval('findIndex(notArray, "value > 0")', {notArray: 'hello'});
            expect(result).toBeUndefined();
        });

        test('handles async expression evaluation', async () => {
            const result = await jexl.eval('findIndex(items, "asyncGt(value, 2)")', {items: [1, 2, 3, 4]});
            expect(result).toBe(2);
        });

        test('works as a transform', async () => {
            const result = await jexl.eval('items|findIndex("asyncGt(value, 3)")', {items: [1, 2, 3, 4, 5]});
            expect(result).toBe(3);
        });
    });

    describe('reduce', () => {
        test('reduces array with initial value', async () => {
            const result = await jexl.eval('reduce(items, "accumulator + value", 0)', {items: [1, 2, 3, 4]});
            expect(result).toBe(10);
        });

        test('exposes index and array in expression context', async () => {
            // accumulates indices: 0+1+2 = 3
            const result = await jexl.eval('reduce(items, "accumulator + index", 0)', {items: ['a', 'b', 'c']});
            expect(result).toBe(3);
        });

        test('returns undefined for non-array input', async () => {
            const result = await jexl.eval('reduce(notArray, "accumulator + value", 0)', {notArray: 'hello'});
            expect(result).toBeUndefined();
        });

        test('handles async expression evaluation', async () => {
            // asyncDouble(value) doubles each value, then accumulates: 0 + 2 + 4 + 6 = 12
            const result = await jexl.eval('reduce(items, "accumulator + asyncDouble(value)", 0)', {items: [1, 2, 3]});
            expect(result).toBe(12);
        });

        test('works as a transform', async () => {
            const result = await jexl.eval('items|reduce("accumulator + asyncDouble(value)", 0)', {items: [1, 2, 3]});
            expect(result).toBe(12);
        });

        test('processes items sequentially (accumulator from previous step is used)', async () => {
            // Concatenate strings to verify sequential order
            const result = await jexl.eval('reduce(items, "accumulator + value", "")', {items: ['a', 'b', 'c']});
            expect(result).toBe('abc');
        });
    });
});
