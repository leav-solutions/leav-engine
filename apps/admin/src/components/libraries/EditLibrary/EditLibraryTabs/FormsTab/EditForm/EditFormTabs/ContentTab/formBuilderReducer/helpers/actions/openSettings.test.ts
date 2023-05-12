// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {formBuilderReducer} from '../..';
import {FormBuilderActionTypes} from '../../formBuilderReducer';
import {formElem1, mockInitialState} from '../../_fixtures/fixtures';

describe('formBuilderReducer', () => {
    test('OPEN_SETTINGS', async () => {
        const newState = formBuilderReducer(mockInitialState, {
            type: FormBuilderActionTypes.OPEN_SETTINGS,
            element: {
                ...formElem1
            }
        });

        expect(newState.elementInSettings).toEqual({...formElem1});
        expect(newState.openSettings).toBe(true);
    });
});
