// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockRecord} from '__mocks__/common/record';
import {mockRecordPropertyWithAttribute} from '__mocks__/common/value';
import editRecordModalReducer, {
    EditRecordReducerActionsTypes,
    IEditRecordReducerState,
    initialState
} from './editRecordModalReducer';

describe('editRecordReducer', () => {
    const mockInitialState: IEditRecordReducerState = {
        ...initialState,
        record: mockRecord
    };

    test('SET_ACTIVE_VALUE', async () => {
        const newState = editRecordReducer(mockInitialState, {
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            value: mockRecordPropertyWithAttribute
        });
        expect(newState.activeValue).toEqual(mockRecordPropertyWithAttribute);
        expect(newState.sidebarContent).toBe('valueDetails');

        const newState2 = editRecordReducer(mockInitialState, {
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            value: null
        });
        expect(newState2.sidebarContent).toBe('summary');
    });

    test('SET_SIDEBAR_CONTENT', async () => {
        expect(
            editRecordModalReducer(mockInitialState, {
                type: EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT,
                content: 'valueDetails'
            }).sidebarContent
        ).toBe('valueDetails');
    });
});
