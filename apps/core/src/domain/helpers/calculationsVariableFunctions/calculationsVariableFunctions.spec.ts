// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IActionsListContext} from '_types/actionsList';
import calculationsVariableFunctions from '.';

const mockRecordDomain: Mockify<IRecordDomain> = {
    getRecordFieldValue: global.__mockPromise([{value: 'test'}])
};
const mockAttributeDomainDomain: Mockify<IAttributeDomain> = {
    getAttributeProperties: global.__mockPromise({linked_library_id: 'meh'})
};
describe('calculationVariable', () => {
    const calculationFunctions = calculationsVariableFunctions({
        'core.domain.record': mockRecordDomain as IRecordDomain,
        'core.domain.attribute': mockAttributeDomainDomain as IAttributeDomain
    });
    const ctx: IActionsListContext = {};
    test('test getValue', async () => {
        const res = await calculationFunctions.getValue.run(ctx, [{value: 'meh'}], ['toto']);
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('value');
        expect(res[0].value).toBe('test');
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
