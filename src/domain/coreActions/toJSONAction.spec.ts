import toJSONAction from './toJSONAction';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';

describe('toJSONAction', () => {
    const action = toJSONAction().action;
    const attrText = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('toJSON', async () => {
        expect(action({test: 'aaa', toto: {tata: true}}, {}, ctx)).toBe('{"test":"aaa","toto":{"tata":true}}');
    });
});
