import {ActionsListEvents, type IActionsListContext} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import toUppercaseAction from './toUppercaseAction';

describe('toUppercaseAction', () => {
    const action = toUppercaseAction().action;
    const ctx: IActionsListContext = {
        attribute: {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE},
        userId: 'test_user',
        actionEvent: ActionsListEvents.GET_VALUE,
    };

    test('toUppercase', async () => {
        expect((await action([{payload: 'azerty'}], {}, ctx)).values[0].payload).toBe('AZERTY');
        expect((await action([{payload: null}], {}, ctx)).values[0].payload).toBe(null);
    });
});
