// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IActionsListContext} from '_types/actionsList';
import calculationsVariableFunctions from '.';
import {TypeGuards} from '../../../utils';

const mockRecordDomain = {
    getRecordFieldValue: jest.fn()
} satisfies Mockify<IRecordDomain>;

const mockAttributeDomain = {
    getAttributeProperties: jest.fn()
} satisfies Mockify<IAttributeDomain>;

describe('calculationsVariableFunctions', () => {
    const calculationFunctions = calculationsVariableFunctions({
        'core.domain.record': mockRecordDomain as any,
        'core.domain.attribute': mockAttributeDomain as any
    });
    const ctx: IActionsListContext = {userId: 'test'};

    beforeEach(() => {
        mockRecordDomain.getRecordFieldValue.mockResolvedValue([{payload: 'test'}]);
        mockAttributeDomain.getAttributeProperties.mockResolvedValue({linked_library_id: 'meh'});
    });

    describe('test getValue', () => {
        test('Should map without "raw_payload"', async () => {
            const res = await calculationFunctions.getValue.run(ctx, [{payload: 'meh'}], ['toto']);

            expect(res).toHaveLength(1);
            expect(res[0]).toHaveProperty('payload');
            expect(res[0].payload).toBe('test');
            expect(res[0]).toHaveProperty('raw_payload');
            expect(res[0].raw_payload).toBe(null);
        });

        test('Should map "raw_payload" field', async () => {
            mockRecordDomain.getRecordFieldValue.mockResolvedValue([{payload: 'meh', raw_payload: 42}]);
            mockAttributeDomain.getAttributeProperties.mockResolvedValue({});
            jest.spyOn(TypeGuards, 'isIStandardValue').mockReturnValue(true);

            const res = await calculationFunctions.getValue.run(ctx, [{payload: 'meh'}], ['toto']);

            expect(res).toHaveLength(1);
            expect(res[0]).toHaveProperty('payload');
            expect(res[0].payload).toBe('meh');
            expect(res[0]).toHaveProperty('raw_payload');
            expect(res[0].raw_payload).toBe(42);
        });
    });

    test('test input', async () => {
        const res = await calculationFunctions.input.run(ctx, [{payload: 'meh'}], ['toto']);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('payload');
        expect(res[0].payload).toBe('meh');
    });

    test('test first', async () => {
        const res = await calculationFunctions.first.run(ctx, [{payload: 'meh'}, {payload: 'meh2'}], ['toto']);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('payload');
        expect(res[0].payload).toBe('meh');
    });

    test('test last', async () => {
        const res = await calculationFunctions.last.run(
            ctx,
            [{payload: 'meh'}, {payload: 'meh2'}, {payload: 'meh3'}],
            ['toto']
        );
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('payload');
        expect(res[0].payload).toBe('meh3');
    });

    test('test sum', async () => {
        const res = await calculationFunctions.sum.run(ctx, [{payload: 1}, {payload: 2}, {payload: 3}], ['toto']);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('payload');
        expect(res[0].payload).toBe(6);
    });

    test('test avg', async () => {
        const res = await calculationFunctions.avg.run(ctx, [{payload: 1}, {payload: 2}, {payload: 3}], ['toto']);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('payload');
        expect(res[0].payload).toBe(2);
    });

    test('test concat', async () => {
        const res = await calculationFunctions.concat.run(ctx, [{payload: 1}, {payload: 2}, {payload: 3}], ['toto']);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('payload');
        expect(res[0].payload).toBe('1toto2toto3');
    });

    test('test dedup', async () => {
        const res = await calculationFunctions.dedup.run(
            ctx,
            [{payload: 2}, {payload: 1}, {payload: 2}, {payload: 3}],
            ['toto']
        );
        expect(res).toHaveLength(3);
        expect(res[0]).toHaveProperty('payload');
        expect(res[0].payload).toBe(2);
        expect(res[1]).toHaveProperty('payload');
        expect(res[1].payload).toBe(1);
        expect(res[2]).toHaveProperty('payload');
        expect(res[2].payload).toBe(3);
    });
});
