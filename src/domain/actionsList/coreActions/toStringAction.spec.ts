import toStringAction from './toStringAction';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';

describe('toStringAction', () => {
    const action = toStringAction().action;
    const attrText = {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('toString', async () => {
        expect(action('test', {}, ctx)).toBe('test');
        expect(action(12345, {}, ctx)).toBe('12345');
        expect(action(true, {}, ctx)).toBe('true');
    });
});
