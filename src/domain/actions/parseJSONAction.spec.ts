import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import parseJSONAction from './parseJSONAction';

describe('parseJSONAction', () => {
    const action = parseJSONAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('parseJSON', async () => {
        expect(action('{"test":"aaa","toto":{"tata":true}}', {}, ctx)).toMatchObject({test: 'aaa', toto: {tata: true}});
    });
});
