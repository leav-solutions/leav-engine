import {ActionsListEvents, type IActionsListContext} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes, type IAttribute} from '../../_types/attribute';
import parseJSONAction from './parseJSONAction';

describe('parseJSONAction', () => {
    const action = parseJSONAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx: IActionsListContext = {
        attribute: attrText,
        userId: 'test_user',
        actionEvent: ActionsListEvents.GET_VALUE,
    };
    test('parseJSON', async () => {
        expect(
            (await action([{payload: '{"test":"aaa","toto":{"tata":true}}'}], {}, ctx)).values[0].payload,
        ).toMatchObject({test: 'aaa', toto: {tata: true}});
        expect((await action([{payload: null}], {}, ctx)).values[0].payload).toBe(null);
    });
});
