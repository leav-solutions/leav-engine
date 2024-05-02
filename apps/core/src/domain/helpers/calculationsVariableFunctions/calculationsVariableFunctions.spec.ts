// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IActionsListContext} from '_types/actionsList';
import calculationsVariableFunctions from '.';
import {TypeGuards} from '../../../utils';

const mockRecordDomain: Mockify<IRecordDomain> = {
    getRecordFieldValue: jest.fn()
};

const mockAttributeDomain: Mockify<IAttributeDomain> = {
    getAttributeProperties: jest.fn()
};

describe('calculationsVariableFunctions', () => {
    const calculationFunctions = calculationsVariableFunctions({
        'core.domain.record': mockRecordDomain as IRecordDomain,
        'core.domain.attribute': mockAttributeDomain as IAttributeDomain
    });
    const ctx: IActionsListContext = {};

    beforeEach(() => {
        mockRecordDomain.getRecordFieldValue.mockResolvedValue([{value: 'test'}]);
        mockAttributeDomain.getAttributeProperties.mockResolvedValue({linked_library_id: 'meh'});
    });

    describe('test getValue', () => {
        test('Should map without "raw_value"', async () => {
            const res = await calculationFunctions.getValue.run(ctx, [{value: 'meh'}], ['toto']);

            expect(res).toHaveLength(1);
            expect(res[0]).toHaveProperty('value');
            expect(res[0].value).toBe('test');
            expect(res[0]).toHaveProperty('raw_value');
            expect(res[0].raw_value).toBe(null);
        });

        test('Should map "raw_value" field', async () => {
            mockRecordDomain.getRecordFieldValue.mockResolvedValue([{value: 'meh', raw_value: 42}]);
            mockAttributeDomain.getAttributeProperties.mockResolvedValue({});
            jest.spyOn(TypeGuards, 'isIStandardValue').mockReturnValue(true);

            const res = await calculationFunctions.getValue.run(ctx, [{value: 'meh'}], ['toto']);

            expect(res).toHaveLength(1);
            expect(res[0]).toHaveProperty('value');
            expect(res[0].value).toBe('meh');
            expect(res[0]).toHaveProperty('raw_value');
            expect(res[0].raw_value).toBe(42);
        });
    });

    test('test input', async () => {
        const res = await calculationFunctions.input.run(ctx, [{value: 'meh'}], ['toto']);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('value');
        expect(res[0].value).toBe('meh');
    });

    test('test first', async () => {
        const res = await calculationFunctions.first.run(ctx, [{value: 'meh'}, {value: 'meh2'}], ['toto']);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('value');
        expect(res[0].value).toBe('meh');
    });

    test('test last', async () => {
        const res = await calculationFunctions.last.run(
            ctx,
            [{value: 'meh'}, {value: 'meh2'}, {value: 'meh3'}],
            ['toto']
        );
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('value');
        expect(res[0].value).toBe('meh3');
    });

    test('test sum', async () => {
        const res = await calculationFunctions.sum.run(ctx, [{value: 1}, {value: 2}, {value: 3}], ['toto']);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('value');
        expect(res[0].value).toBe(6);
    });

    test('test avg', async () => {
        const res = await calculationFunctions.avg.run(ctx, [{value: 1}, {value: 2}, {value: 3}], ['toto']);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('value');
        expect(res[0].value).toBe(2);
    });

    test('test concat', async () => {
        const res = await calculationFunctions.concat.run(ctx, [{value: 1}, {value: 2}, {value: 3}], ['toto']);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('value');
        expect(res[0].value).toBe('1toto2toto3');
    });

    test('test dedup', async () => {
        const res = await calculationFunctions.dedup.run(
            ctx,
            [{value: 2}, {value: 1}, {value: 2}, {value: 3}],
            ['toto']
        );
        expect(res).toHaveLength(3);
        expect(res[0]).toHaveProperty('value');
        expect(res[0].value).toBe(2);
        expect(res[1]).toHaveProperty('value');
        expect(res[1].value).toBe(1);
        expect(res[2]).toHaveProperty('value');
        expect(res[2].value).toBe(3);
    });
});
