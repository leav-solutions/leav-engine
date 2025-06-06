// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import formatNumberAction from './formatNumberAction';

describe('formatNumberAction', () => {
    const action = formatNumberAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.DATE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText, userId: 'test_user'};
    test('formatNumber', async () => {
        expect(
            (
                await action(
                    [{payload: 123456.781}],
                    {thousandsSeparator: ' ', decimalsSeparator: ',', decimals: 2, prefix: '=> ', suffix: ' €'},
                    ctx
                )
            ).values[0].payload
        ).toBe('=> 123 456,78 €');
        expect(
            (
                await action(
                    [{payload: 123456.786}],
                    {thousandsSeparator: ' ', decimalsSeparator: ',', decimals: 2, suffix: ' €'},
                    ctx
                )
            ).values[0].payload
        ).toBe('123 456,79 €');
        expect(
            (await action([{payload: 123456.78}], {thousandsSeparator: '.', decimalsSeparator: ',', decimals: 4}, ctx))
                .values[0].payload
        ).toBe('123.456,7800');
        expect((await action([{payload: 'aaa'}], {decimals: 2}, ctx)).values[0].payload).toBe('');
        expect((await action([{payload: null}], {decimals: 2}, ctx)).values[0].payload).toBe(null);
    });
});
