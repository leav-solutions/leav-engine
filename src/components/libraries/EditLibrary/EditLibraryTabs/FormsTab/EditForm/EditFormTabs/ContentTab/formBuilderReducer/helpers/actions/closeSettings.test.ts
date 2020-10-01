import {formBuilderReducer} from '../..';
import {FormBuilderActionTypes} from '../../formBuilderReducer';
import {formElem1, initialState} from '../../_fixtures/fixtures';

describe('formBuilderReducer', () => {
    test('CLOSE_SETTNGS', async () => {
        const newState = formBuilderReducer(
            {...initialState, openSettings: true, elementInSettings: {...formElem1}},
            {
                type: FormBuilderActionTypes.CLOSE_SETTINGS
            }
        );

        expect(newState.elementInSettings).toBe(null);
        expect(newState.openSettings).toBe(false);
    });
});
