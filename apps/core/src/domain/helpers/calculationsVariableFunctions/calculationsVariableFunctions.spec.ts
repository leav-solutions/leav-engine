// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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

    describe('test getValue', () => {
        it('Should return value on linked attribute', async () => {
            mockRecordDomain.getRecordFieldValue.mockResolvedValue([{payload: {id: 'linkedRecordId'}}]);
            mockAttributeDomain.getAttributeProperties.mockResolvedValue({linked_library: 'libraryId'});

            const res = await calculationFunctions.getValue.run(ctx, [{library: 'library', recordId: 'recordId'}], 'attributeId');

            expect(res).toHaveLength(1);
            expect(res[0].library).toBe('libraryId');
            expect(res[0].recordId).toBe('linkedRecordId');
            expect(res[0].payload).toBe('linkedRecordId');
            expect(res[0]).not.toHaveProperty('raw_payload');
        });

        it('Should return value on tree attribute', async () => {
            mockRecordDomain.getRecordFieldValue.mockResolvedValue([{payload: {record: {library: 'treeLibraryId', id: 'treeRecordId'}}}]);
            mockAttributeDomain.getAttributeProperties.mockResolvedValue({linked_tree: 'treeId'});

            const res = await calculationFunctions.getValue.run(ctx,[{library: 'library', recordId: 'recordId'}], 'attributeId');

            expect(res).toHaveLength(1);
            expect(res[0].library).toBe('treeLibraryId');
            expect(res[0].recordId).toBe('treeRecordId');
            expect(res[0].payload).toBe('treeRecordId');
            expect(res[0]).not.toHaveProperty('raw_payload');
        });

        it('Should return value on standard attribute', async () => {
            mockRecordDomain.getRecordFieldValue.mockResolvedValue([{payload: 'payload', raw_payload: 'rawPayload'}]);
            mockAttributeDomain.getAttributeProperties.mockResolvedValue({});

            jest.spyOn(TypeGuards, 'isIStandardValue').mockReturnValue(true);

            const res = await calculationFunctions.getValue.run(ctx, [{library: 'library', recordId: 'recordId'}], ['toto']);

            expect(res).toHaveLength(1);
            expect(res[0].library).toBe('library');
            expect(res[0].recordId).toBe('recordId');
            expect(res[0].payload).toBe('payload');
            expect(res[0].raw_payload).toBe('rawPayload');
        });


    });

    test('test input', async () => {
        const res = await calculationFunctions.input.run(ctx, [{payload: 'meh'}], ['toto']);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('payload');
        expect(res[0].payload).toBe('meh');
    });

    test('should get the "from" date on period attribute', async () => {
        const inputValue = [
            {payload: {from: 17438843200, to: 1742472000}, raw_payload: {from: 17438843233, to: 1742472033}}
        ];

        const res = await calculationFunctions.fromDate.run(ctx, inputValue, ['attributeKey']);

        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('payload');
        expect(res[0].payload).toBe(inputValue[0].raw_payload.from);
    });

    test('should get the "to" date on period attribute', async () => {
        const inputValue = [
            {payload: {from: 17438843200, to: 1742472000}, raw_payload: {from: 17438843233, to: 1742472033}}
        ];

        const res = await calculationFunctions.toDate.run(ctx, inputValue, ['attributeKey']);

        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('payload');
        expect(res[0].payload).toBe(inputValue[0].raw_payload.to);
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
