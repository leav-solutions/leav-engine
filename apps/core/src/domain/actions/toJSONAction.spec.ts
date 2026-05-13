import {ActionsListEvents, type IActionsListContext} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes, type IAttribute} from '../../_types/attribute';
import toJSONAction from './toJSONAction';

describe('toJSONAction', () => {
    const action = toJSONAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx: IActionsListContext = {
        attribute: attrText,
        userId: 'test_user',
        actionEvent: ActionsListEvents.GET_VALUE,
    };
    test('toJSON', async () => {
        expect((await action([{payload: {test: 'aaa', toto: {tata: true}}}], {}, ctx)).values[0].payload).toBe(
            '{"test":"aaa","toto":{"tata":true}}',
        );
        expect((await action([{payload: null}], {}, ctx)).values[0].payload).toBe(null);
    });
});
