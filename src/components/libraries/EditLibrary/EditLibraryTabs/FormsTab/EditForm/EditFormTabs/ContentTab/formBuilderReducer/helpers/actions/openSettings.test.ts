import {formBuilderReducer} from '../..';
import {FormBuilderActionTypes} from '../../formBuilderReducer';
import {formElem1, initialState} from '../../_fixtures/fixtures';

describe('formBuilderReducer', () => {
    test('OPEN_SETTINGS', async () => {
        const newState = formBuilderReducer(initialState, {
            type: FormBuilderActionTypes.OPEN_SETTINGS,
            element: {
                ...formElem1
            }
        });

        expect(newState.elementInSettings).toEqual({...formElem1});
        expect(newState.openSettings).toBe(true);
    });
});
