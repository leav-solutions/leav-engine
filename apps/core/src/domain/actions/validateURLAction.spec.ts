import {ActionsListEvents, type IActionsListContext} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import validateURLAction from './validateURLAction';

describe('validateURLFormatAction', () => {
    const action = validateURLAction().action;

    const ctx: IActionsListContext = {
        attribute: {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE},
        userId: 'test_user',
        actionEvent: ActionsListEvents.SAVE_VALUE,
    };

    test('validateURL should throw', async () => {
        const res = await action([{payload: 'test'}], {}, ctx);
        expect(res.errors.length).toBe(1);
    });

    test('validateURL should return URL', async () => {
        const res = await action([{payload: 'http://url.com'}], {}, ctx);
        expect(res.values[0].payload).toBe('http://url.com');
    });
});
