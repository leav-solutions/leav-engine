import encryptAction from './encryptAction';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';

describe('encryptAction', () => {
    const action = encryptAction().action;
    const attrText = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('encrypt', async () => {
        const res = await action('MyPAssWd', {}, ctx);
        expect(typeof res).toBe('string');
        expect(('' + res).length).toBe(60);
    });
});
