import {interleaveElement} from './interleaveElement';

describe('interleavElement', () => {
    test('Should interleave an element between each element of array', async () => {
        expect(interleaveElement(42, [[1], [2], [3]])).toEqual([1, 42, 2, 42, 3]);
        expect(interleaveElement(42, [])).toEqual([]);
        expect(interleaveElement(42, [[1]])).toEqual([1]);
        expect(interleaveElement({sepa: 'rator'}, [[1], [2], [3]])).toEqual([
            1,
            {sepa: 'rator'},
            2,
            {sepa: 'rator'},
            3,
        ]);
        expect(interleaveElement(null, [[1], [2], [3]])).toEqual([1, null, 2, null, 3]);
    });
});
