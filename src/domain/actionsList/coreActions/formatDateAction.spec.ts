import formatDateAction from './formatDateAction';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';

describe('formatDateAction', () => {
    const action = formatDateAction().action;
    const attrText = {id: 'test_attr', format: AttributeFormats.DATE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('formatDate', async () => {
        expect(action(2119477320, {format: 'D/M/YY HH:mm'}, ctx)).toBe('1/3/37 00:42');
        expect(action(2119477320, {}, ctx)).toBe('2037-03-01T00:42:00+01:00');
        expect(action('aaaa', {}, ctx)).toBe('');
    });
});
