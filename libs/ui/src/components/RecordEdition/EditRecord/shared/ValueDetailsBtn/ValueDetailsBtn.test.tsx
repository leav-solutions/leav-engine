// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {
    EditRecordReducerActionsTypes,
    initialState
} from '_ui/components/RecordEdition/editRecordModalReducer/editRecordModalReducer';
import * as useEditRecordModalReducer from '_ui/components/RecordEdition/editRecordModalReducer/useEditRecordModalReducer';
import {RecordFormAttributeStandardAttributeFragment} from '_ui/_gqlTypes';
import {IRecordPropertyStandard} from '_ui/_queries/records/getRecordPropertiesQuery';
import {render, screen, waitFor} from '_ui/_tests/testUtils';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import ValueDetailsBtn from './ValueDetailsBtn';

describe('ValueDetailsBtn', () => {
    const mockEditRecordModalDispatch = jest.fn();
    jest.spyOn(useEditRecordModalReducer, 'useEditRecordModalReducer').mockImplementation(() => ({
        state: initialState,
        dispatch: mockEditRecordModalDispatch
    }));

    const mockValue: IRecordPropertyStandard = {
        value: 'my value',
        raw_value: 'my raw value',
        created_at: null,
        created_by: null,
        modified_at: null,
        modified_by: null,
        id_value: null
    };

    const mockAttribute: RecordFormAttributeStandardAttributeFragment = {
        ...mockFormAttribute,
        label: {
            fr: 'my attribute label'
        },
        system: false,
        values_list: {enable: false, allowFreeEntry: false, values: []}
    };

    test('Open value details on click', async () => {
        render(<ValueDetailsBtn value={mockValue} attribute={mockAttribute} />);

        const valueDetailsBtn = screen.getByRole('button', {name: /info/});
        expect(screen.queryByText('ValueDetails')).not.toBeInTheDocument();

        expect(valueDetailsBtn).toBeInTheDocument();
        userEvent.click(valueDetailsBtn);

        await waitFor(() => expect(mockEditRecordModalDispatch).toBeCalled());
        expect(mockEditRecordModalDispatch.mock.calls[0][0].type).toBe(EditRecordReducerActionsTypes.SET_ACTIVE_VALUE);
    });
});
