import {ActionsListEvents, type IActionsListContext} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import toLowercaseAction from './toLowercaseAction';

describe('toLowercaseAction', () => {
    const action = toLowercaseAction().action;
    const ctx: IActionsListContext = {
        attribute: {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE},
        userId: 'test_user',
        actionEvent: ActionsListEvents.GET_VALUE,
    };

    test('toLowercase', async () => {
        expect((await action([{payload: 'AZERTY'}], {}, ctx)).values[0].payload).toBe('azerty');
        expect((await action([{payload: null}], {}, ctx)).values[0].payload).toBe(null);
    });
});
