// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import formatNumberAction from './formatNumberAction';

describe('formatNumberAction', () => {
    const action = formatNumberAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.DATE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('formatNumber', async () => {
        expect(
            action(
                123456.781,
                {thousandsSeparator: ' ', decimalsSeparator: ',', decimals: 2, prefix: '=> ', suffix: ' €'},
                ctx
            )
        ).toBe('=> 123 456,78 €');
        expect(
            action(123456.786, {thousandsSeparator: ' ', decimalsSeparator: ',', decimals: 2, suffix: ' €'}, ctx)
        ).toBe('123 456,79 €');
        expect(action(123456.78, {thousandsSeparator: '.', decimalsSeparator: ',', decimals: 4}, ctx)).toBe(
            '123.456,7800'
        );
        expect(action('aaa', {}, ctx)).toBe('');
    });
});
