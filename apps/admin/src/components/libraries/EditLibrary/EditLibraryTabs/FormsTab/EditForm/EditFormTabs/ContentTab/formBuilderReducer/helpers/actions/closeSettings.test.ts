import {formBuilderReducer} from '../..';
import {FormBuilderActionTypes} from '../../formBuilderReducer';
import {formElem1, mockInitialState} from '../../_fixtures/fixtures';

describe('formBuilderReducer', () => {
    test('CLOSE_SETTNGS', async () => {
        const newState = formBuilderReducer(
            {...mockInitialState, openSettings: true, elementInSettings: {...formElem1}},
            {
                type: FormBuilderActionTypes.CLOSE_SETTINGS,
            },
        );

        expect(newState.elementInSettings).toBe(null);
        expect(newState.openSettings).toBe(false);
    });
});
