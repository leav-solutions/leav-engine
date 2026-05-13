import {ActionsListEvents, type IActionsListContext} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes, type IAttribute} from '../../_types/attribute';
import toBooleanAction from './toBooleanAction';

describe('toBooleanAction', () => {
    const action = toBooleanAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx: IActionsListContext = {
        attribute: attrText,
        userId: 'test_user',
        actionEvent: ActionsListEvents.GET_VALUE,
    };
    test('toBoolean', async () => {
        expect((await action([{payload: true}], {}, ctx)).values[0].payload).toBe(true);
        expect((await action([{payload: false}], {}, ctx)).values[0].payload).toBe(false);
        expect((await action([{payload: 1}], {}, ctx)).values[0].payload).toBe(true);
        expect((await action([{payload: 0}], {}, ctx)).values[0].payload).toBe(false);
        expect((await action([{payload: 'true'}], {}, ctx)).values[0].payload).toBe(true);
        expect((await action([{payload: 'false'}], {}, ctx)).values[0].payload).toBe(false);
        expect((await action([{payload: 'totot'}], {}, ctx)).values[0].payload).toBe(true);
        expect((await action([{payload: null}], {}, ctx)).values[0].payload).toBe(false);
    });
});
