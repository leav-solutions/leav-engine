import {ActionsListEvents, type IActionsListContext} from '../../_types/actionsList';
import {mockStandardValue} from '../../__tests__/mocks/value';
import {AttributeFormats, AttributeTypes, type IAttribute} from '../../_types/attribute';
import encryptAction from './encryptAction';

describe('encryptAction', () => {
    const action = encryptAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx: IActionsListContext = {
        attribute: attrText,
        userId: 'test_user',
        actionEvent: ActionsListEvents.SAVE_VALUE,
    };

    test('should encrypt a value', async () => {
        const res = await action([{...mockStandardValue, payload: 'MyPAssWd'}], {}, ctx);

        const valuePayload = res.values[0].payload;
        expect(typeof valuePayload).toBe('string');
        expect(('' + valuePayload).length).toBe(60);
    });

    test('should return null if no value', async () => {
        expect(await action([{...mockStandardValue, payload: null}], {}, ctx)).toEqual({
            errors: [],
            values: [{...mockStandardValue, payload: null}],
        });
    });
});
