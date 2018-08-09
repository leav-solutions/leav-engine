import toNumberAction from './toNumberAction';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';

describe('toNumberAction', () => {
    const action = toNumberAction().action;
    const attrText = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('toNumber', async () => {
        expect(action(12345, {}, ctx)).toBe(12345);
        expect(action('12345', {}, ctx)).toBe(12345);
        expect(action('12345.45', {}, ctx)).toBe(12345.45);
        expect(action(true, {}, ctx)).toBe(1);
        expect(action(false, {}, ctx)).toBe(0);
        expect(action('aaaa', {}, ctx)).toBe(NaN);
    });
});
