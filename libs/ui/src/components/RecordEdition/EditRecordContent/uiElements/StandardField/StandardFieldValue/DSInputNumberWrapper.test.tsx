// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {DSInputNumberWrapper} from './DSInputNumberWrapper';
import {FieldScope} from '../../../_types';
import {
    InheritedFlags,
    IStandardFieldReducerState,
    StandardFieldValueState
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockFormElementInput} from '_ui/__mocks__/common/form';
import {mockAttributeLink} from '_ui/__mocks__/common/attribute';
import userEvent from '@testing-library/user-event';
import {RecordFormElementsValueStandardValue} from '_ui/hooks/useGetRecordForm';
import {AntForm} from 'aristid-ds';

const label = 'label';
const idValue = '123';
const mockValue = {
    index: 0,
    displayValue: '4',
    editingValue: '4',
    originRawValue: '4',
    idValue: null,
    isEditing: false,
    isErrorDisplayed: false,
    value: {
        id_value: null,
        value: '4',
        raw_value: '4',
        modified_at: null,
        created_at: null,
        created_by: null,
        modified_by: null
    },
    version: null,
    error: '',
    state: StandardFieldValueState.PRISTINE
};

const getInitialState = (required: boolean): IStandardFieldReducerState => ({
    record: mockRecord,
    formElement: {
        ...mockFormElementInput,
        settings: {
            label,
            required
        }
    },
    attribute: mockAttributeLink,
    isReadOnly: false,
    activeScope: FieldScope.CURRENT,
    values: {
        [FieldScope.CURRENT]: {
            version: null,
            values: {[idValue]: mockValue}
        },
        [FieldScope.INHERITED]: null
    },
    metadataEdit: false,
    inheritedValue: null,
    isInheritedNotOverrideValue: false,
    isInheritedOverrideValue: false,
    isInheritedValue: false
});

const inheritedValues = [
    {
        isInherited: null,
        value: '8',
        raw_value: '8'
    },
    {
        isInherited: true,
        value: '3.5',
        raw_value: '3.5'
    }
];

const inheritedNotOverrideValue: InheritedFlags = {
    isInheritedValue: true,
    isInheritedOverrideValue: false,
    isInheritedNotOverrideValue: true,
    inheritedValue: {raw_value: inheritedValues[1].raw_value}
};

const inheritedOverrideValue: InheritedFlags = {
    isInheritedValue: true,
    isInheritedOverrideValue: true,
    isInheritedNotOverrideValue: false,
    inheritedValue: {raw_value: inheritedValues[1].raw_value}
};

describe('DSInputNumberWrapper', () => {
    const mockHandleSubmit = jest.fn();
    const mockOnChange = jest.fn();
    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({});
        mockOnChange.mockReset();
        mockHandleSubmit.mockReset();
    });

    test('Should submit empty value if field is not required', async () => {
        const state = getInitialState(false);
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputNumberWrapper
                        state={state}
                        infoButton=""
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const input = screen.getByRole('spinbutton');
        await user.click(input);
        await user.tab();

        expect(mockHandleSubmit).toHaveBeenCalledWith('', state.attribute.id);
        expect(mockOnChange).toHaveBeenCalled();
    });

    describe('With required input and no inheritance', () => {
        test('Should submit the value if field is not empty', async () => {
            const state = getInitialState(true);
            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputNumberWrapper
                            state={state}
                            infoButton=""
                            handleSubmit={mockHandleSubmit}
                            onChange={mockOnChange}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const text = 'text';
            const input = screen.getByRole('spinbutton');
            await user.click(input);
            await user.type(input, text);
            await user.tab();

            expect(mockHandleSubmit).toHaveBeenCalledWith(text, state.attribute.id);
            expect(mockOnChange).toHaveBeenCalled();
        });

        test('Should submit the default value if field is empty', async () => {
            const state = getInitialState(true);
            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputNumberWrapper
                            state={state}
                            infoButton=""
                            handleSubmit={mockHandleSubmit}
                            onChange={mockOnChange}
                            value={mockValue.originRawValue}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const input = screen.getByRole('spinbutton');
            await user.click(input);
            await user.tab();

            expect(mockHandleSubmit).toHaveBeenCalledWith(mockValue.originRawValue, state.attribute.id);
        });
    });

    describe('With inheritance', () => {
        test("Should display the inherited value by default and not save if we don't change it", async () => {
            let state = getInitialState(false);
            state = {
                ...state,
                ...inheritedNotOverrideValue,
                formElement: {...state.formElement, values: inheritedValues}
            };
            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputNumberWrapper
                            state={state}
                            infoButton=""
                            handleSubmit={mockHandleSubmit}
                            onChange={mockOnChange}
                            value={inheritedValues[1].raw_value}
                        />
                    </AntForm.Item>
                </AntForm>
            );
            const input = screen.getByRole('spinbutton');
            expect(input).toHaveValue(inheritedValues[1].raw_value);

            await user.click(input);
            await user.tab();

            expect(mockHandleSubmit).not.toHaveBeenCalled();
        });

        test('Should display the override value in the input and inherited value under it', async () => {
            let state = getInitialState(false);
            state = {
                ...state,
                ...inheritedOverrideValue,
                formElement: {...state.formElement, values: inheritedValues}
            };

            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputNumberWrapper
                            state={state}
                            infoButton=""
                            handleSubmit={mockHandleSubmit}
                            onChange={mockOnChange}
                            value={inheritedValues[0].raw_value}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const input = screen.getByRole('spinbutton');
            const helperText = screen.getByText(/3.5/);
            expect(input).toHaveValue(inheritedValues[0].raw_value);
            expect(helperText).toBeInTheDocument();
        });
    });
});
