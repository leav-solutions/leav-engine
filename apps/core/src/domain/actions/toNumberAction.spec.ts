import {ActionsListEvents, type IActionsListContext} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes, type IAttribute} from '../../_types/attribute';
import toNumberAction from './toNumberAction';

describe('toNumberAction', () => {
    const action = toNumberAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx: IActionsListContext = {
        attribute: attrText,
        userId: 'test_user',
        actionEvent: ActionsListEvents.GET_VALUE,
    };
    test('toNumber', async () => {
        expect((await action([{payload: 12345}], {}, ctx)).values[0].payload).toBe(12345);
        expect((await action([{payload: '12345'}], {}, ctx)).values[0].payload).toBe(12345);
        expect((await action([{payload: '12345.45'}], {}, ctx)).values[0].payload).toBe(12345.45);
        expect((await action([{payload: true}], {}, ctx)).values[0].payload).toBe(1);
        expect((await action([{payload: false}], {}, ctx)).values[0].payload).toBe(0);
        expect((await action([{payload: 'aaaa'}], {}, ctx)).values[0].payload).toBe(NaN);
        expect((await action([{payload: null}], {}, ctx)).values[0].payload).toBe(null);
    });
});
