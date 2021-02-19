// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {formBuilderReducer} from '../..';
import {FormBuilderActionTypes} from '../../formBuilderReducer';
import {formElem1, mockInitialState} from '../../_fixtures/fixtures';

describe('formBuilderReducer', () => {
    test('CLOSE_SETTNGS', async () => {
        const newState = formBuilderReducer(
            {...mockInitialState, openSettings: true, elementInSettings: {...formElem1}},
            {
                type: FormBuilderActionTypes.CLOSE_SETTINGS
            }
        );

        expect(newState.elementInSettings).toBe(null);
        expect(newState.openSettings).toBe(false);
    });
});
