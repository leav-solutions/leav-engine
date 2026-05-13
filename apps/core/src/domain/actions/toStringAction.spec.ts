import {ActionsListEvents, type IActionsListContext} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes, type IAttribute} from '../../_types/attribute';
import toStringAction from './toStringAction';

describe('toStringAction', () => {
    const action = toStringAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE};
    const ctx: IActionsListContext = {
        attribute: attrText,
        userId: 'test_user',
        actionEvent: ActionsListEvents.GET_VALUE,
    };
    test('toString', async () => {
        expect((await action([{payload: 'test'}], {}, ctx)).values[0].payload).toBe('test');
        expect((await action([{payload: 12345}], {}, ctx)).values[0].payload).toBe('12345');
        expect((await action([{payload: true}], {}, ctx)).values[0].payload).toBe('true');
        expect((await action([{payload: null}], {}, ctx)).values[0].payload).toBe(null);
    });
});
