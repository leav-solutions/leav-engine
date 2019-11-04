import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import encryptAction from './encryptAction';

describe('encryptAction', () => {
    const action = encryptAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('encrypt', async () => {
        const res = await action('MyPAssWd', {}, ctx);
        expect(typeof res).toBe('string');
        expect(('' + res).length).toBe(60);
    });
});
