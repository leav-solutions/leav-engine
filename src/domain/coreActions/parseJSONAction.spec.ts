import parseJSONAction from './parseJSONAction';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';

describe('parseJSONAction', () => {
    const action = parseJSONAction().action;
    const attrText = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('parseJSON', async () => {
        expect(action('{"test":"aaa","toto":{"tata":true}}', {}, ctx)).toMatchObject({test: 'aaa', toto: {tata: true}});
    });
});
