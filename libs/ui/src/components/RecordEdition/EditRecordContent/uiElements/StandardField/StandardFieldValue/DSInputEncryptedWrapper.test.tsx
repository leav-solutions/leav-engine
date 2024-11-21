// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {DSInputEncryptedWrapper} from './DSInputEncryptedWrapper';
import {VersionFieldScope} from '../../../_types';
import {
    IStandardFieldReducerState,
    StandardFieldValueState
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockFormElementInput} from '_ui/__mocks__/common/form';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import userEvent from '@testing-library/user-event';
import {AntForm} from 'aristid-ds';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';

const idValue = '123';
const mockValue = {
    index: 0,
    displayValue: 'my value',
    editingValue: 'my editing value',
    originRawValue: 'my raw value',
    idValue: null,
    isEditing: false,
    isErrorDisplayed: false,
    value: {
        id_value: null,
        value: 'my value',
        raw_value: 'my raw value',
        modified_at: null,
        created_at: null,
        created_by: null,
        modified_by: null
    },
    version: null,
    error: '',
    state: StandardFieldValueState.PRISTINE
};

const getInitialState = ({required}: {required: boolean}): IStandardFieldReducerState => ({
    record: mockRecord,
    formElement: {
        ...mockFormElementInput,
        settings: {
            label: {},
            required
        }
    },
    attribute: mockFormAttribute,
    isReadOnly: false,
    activeScope: VersionFieldScope.CURRENT,
    values: {
        [VersionFieldScope.CURRENT]: {
            version: null,
            values: {[idValue]: mockValue}
        },
        [VersionFieldScope.INHERITED]: null
    },
    metadataEdit: false,
    inheritedValue: null,
    isInheritedNotOverrideValue: false,
    isInheritedOverrideValue: false,
    isInheritedValue: false,
    calculatedValue: null,
    isCalculatedNotOverrideValue: false,
    isCalculatedOverrideValue: false,
    isCalculatedValue: false
});

describe('DSInputEncryptedWrapper', () => {
    const mockHandleSubmit = jest.fn();
    const mockOnChange = jest.fn();

    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({});
        mockOnChange.mockReset();
        mockHandleSubmit.mockReset();
    });

    test('Should submit the value', async () => {
        const state = getInitialState({required: true});
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputEncryptedWrapper
                        state={state}
                        attribute={{id: mockFormAttribute.id} as RecordFormAttributeFragment}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const text = 'text';
        const input = screen.getByTestId('kit-input-password');
        await user.click(input);
        await user.type(input, text);
        await user.tab();

        expect(mockHandleSubmit).toHaveBeenCalledWith(text, mockFormAttribute.id);
        expect(mockOnChange).toHaveBeenCalled();
    });

    test('Should allow to clear input', async () => {
        const state = getInitialState({required: false});
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputEncryptedWrapper
                        state={state}
                        value="password"
                        attribute={{id: mockFormAttribute.id} as RecordFormAttributeFragment}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );
        const clearButton = screen.getByRole('button');

        await user.click(clearButton);

        expect(mockHandleSubmit).toHaveBeenCalledWith('', mockFormAttribute.id);
    });
});
