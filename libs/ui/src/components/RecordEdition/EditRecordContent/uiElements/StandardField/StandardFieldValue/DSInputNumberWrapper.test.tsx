// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {DSInputNumberWrapper} from './DSInputNumberWrapper';
import {VersionFieldScope} from '../../../_types';
import {
    CalculatedFlags,
    InheritedFlags,
    IStandardFieldReducerState,
    StandardFieldValueState
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockFormElementInput} from '_ui/__mocks__/common/form';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import userEvent from '@testing-library/user-event';
import {AntForm} from 'aristid-ds';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';

const en_label = 'label';
const fr_label = 'libellé';
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
        payload: '4',
        raw_payload: '4',
        modified_at: null,
        created_at: null,
        created_by: null,
        modified_by: null
    },
    version: null,
    error: '',
    state: StandardFieldValueState.PRISTINE
};

const getInitialState = (required: boolean, fallbackLang = false): IStandardFieldReducerState => ({
    record: mockRecord,
    formElement: {
        ...mockFormElementInput,
        settings: {
            label: fallbackLang ? {en: en_label} : {fr: fr_label, en: en_label},
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

const calculatedValues = [
    {
        isCalculated: null,
        value: '8',
        raw_value: '8'
    },
    {
        isCalculated: true,
        value: '3.5',
        raw_value: '3.5'
    }
];

const calculatedNotOverrideValue: CalculatedFlags = {
    isCalculatedValue: true,
    isCalculatedOverrideValue: false,
    isCalculatedNotOverrideValue: true,
    calculatedValue: {raw_value: calculatedValues[1].raw_value}
};

const calculatedOverrideValue: CalculatedFlags = {
    isCalculatedValue: true,
    isCalculatedOverrideValue: true,
    isCalculatedNotOverrideValue: false,
    calculatedValue: {raw_value: calculatedValues[1].raw_value}
};

describe('DSInputNumberWrapper', () => {
    const mockHandleSubmit = jest.fn();
    const mockOnChange = jest.fn();
    const mockHandleBlur = jest.fn();

    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({});
        mockOnChange.mockReset();
        mockHandleSubmit.mockReset();
        mockHandleBlur.mockReset();
    });

    test('Should display inputNumber with fr label ', async () => {
        const state = getInitialState(false, false);
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputNumberWrapper
                        state={state}
                        attribute={{} as RecordFormAttributeFragment}
                        fieldValue={mockValue}
                        handleSubmit={mockHandleSubmit}
                        handleBlur={mockHandleBlur}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        expect(screen.getByText(fr_label)).toBeVisible();
    });

    test('Should display inputNumber with fallback label ', async () => {
        const state = getInitialState(false, true);
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputNumberWrapper
                        state={state}
                        attribute={{} as RecordFormAttributeFragment}
                        fieldValue={mockValue}
                        handleSubmit={mockHandleSubmit}
                        handleBlur={mockHandleBlur}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        expect(screen.getByText(en_label)).toBeVisible();
    });

    test('Should submit empty value on clear if field is not required', async () => {
        const state = getInitialState(false);
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputNumberWrapper
                        state={state}
                        attribute={{} as RecordFormAttributeFragment}
                        fieldValue={mockValue}
                        handleSubmit={mockHandleSubmit}
                        handleBlur={mockHandleBlur}
                        onChange={mockOnChange}
                        value={42}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const input = screen.getByRole('spinbutton');

        await user.clear(input);
        await user.tab();

        expect(mockOnChange).toHaveBeenCalled();
        expect(mockHandleSubmit).toHaveBeenCalledWith('', state.attribute.id);
    });

    describe('With required input and no inheritance', () => {
        test('Should submit the value if field is not empty', async () => {
            const state = getInitialState(true);
            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputNumberWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={mockValue}
                            handleSubmit={mockHandleSubmit}
                            handleBlur={mockHandleBlur}
                            onChange={mockOnChange}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const text = '7.4';
            const input = screen.getByRole('spinbutton');
            await user.type(input, text);
            await user.tab();

            expect(mockHandleSubmit).toHaveBeenCalledWith(text, state.attribute.id);
            expect(mockOnChange).toHaveBeenCalled();
        });

        test('Should submit the empty value if field is empty', async () => {
            const state = getInitialState(true);
            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputNumberWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={mockValue}
                            handleSubmit={mockHandleSubmit}
                            handleBlur={mockHandleBlur}
                            onChange={mockOnChange}
                            value={mockValue.originRawValue}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const input = screen.getByRole('spinbutton');
            await user.clear(input);
            await user.tab();

            expect(mockHandleSubmit).toHaveBeenCalledWith('', state.attribute.id);
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
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={mockValue}
                            handleSubmit={mockHandleSubmit}
                            handleBlur={mockHandleBlur}
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
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={mockValue}
                            handleSubmit={mockHandleSubmit}
                            handleBlur={mockHandleBlur}
                            onChange={mockOnChange}
                            value={inheritedValues[0].raw_value}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const input = screen.getByRole('spinbutton');
            const helperText = screen.getByText(/3.5/);
            expect(input).toHaveValue(inheritedValues[0].raw_value);
            expect(helperText).toBeVisible();
        });
    });

    describe('With required and inheritance', () => {
        test("Should display the inherited value by default and not save if we don't change it", async () => {
            let state = getInitialState(true);
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
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={mockValue}
                            handleSubmit={mockHandleSubmit}
                            handleBlur={mockHandleBlur}
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
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={mockValue}
                            handleSubmit={mockHandleSubmit}
                            handleBlur={mockHandleBlur}
                            onChange={mockOnChange}
                            value={inheritedValues[0].raw_value}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const input = screen.getByRole('spinbutton');
            const helperText = screen.getByText(/3.5/);
            expect(input).toHaveValue(inheritedValues[0].raw_value);
            expect(helperText).toBeVisible();
        });
    });

    describe('With calculation', () => {
        test("Should display the calculated value by default and not save if we don't change it", async () => {
            let state = getInitialState(false);
            state = {
                ...state,
                ...calculatedNotOverrideValue,
                formElement: {...state.formElement, values: calculatedValues}
            };
            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputNumberWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={mockValue}
                            handleSubmit={mockHandleSubmit}
                            handleBlur={mockHandleBlur}
                            onChange={mockOnChange}
                            value={calculatedValues[1].raw_value}
                        />
                    </AntForm.Item>
                </AntForm>
            );
            const input = screen.getByRole('spinbutton');
            expect(input).toHaveValue(calculatedValues[1].raw_value);

            await user.click(input);
            await user.tab();

            expect(mockHandleSubmit).not.toHaveBeenCalled();
        });

        test('Should display the override value in the input and calculated value under it', async () => {
            let state = getInitialState(false);
            state = {
                ...state,
                ...calculatedOverrideValue,
                formElement: {...state.formElement, values: calculatedValues}
            };

            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputNumberWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={mockValue}
                            handleSubmit={mockHandleSubmit}
                            handleBlur={mockHandleBlur}
                            onChange={mockOnChange}
                            value={calculatedValues[0].raw_value}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const input = screen.getByRole('spinbutton');
            const helperText = screen.getByText(/3.5/);
            expect(input).toHaveValue(calculatedValues[0].raw_value);
            expect(helperText).toBeVisible();
        });
    });

    describe('With required and calculation', () => {
        test("Should display the calculated value by default and not save if we don't change it", async () => {
            let state = getInitialState(true);
            state = {
                ...state,
                ...calculatedNotOverrideValue,
                formElement: {...state.formElement, values: calculatedValues}
            };
            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputNumberWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={mockValue}
                            handleSubmit={mockHandleSubmit}
                            handleBlur={mockHandleBlur}
                            onChange={mockOnChange}
                            value={calculatedValues[1].raw_value}
                        />
                    </AntForm.Item>
                </AntForm>
            );
            const input = screen.getByRole('spinbutton');
            expect(input).toHaveValue(calculatedValues[1].raw_value);

            await user.click(input);
            await user.tab();

            expect(mockHandleSubmit).not.toHaveBeenCalled();
        });

        test('Should display the override value in the input and calculated value under it', async () => {
            let state = getInitialState(false);
            state = {
                ...state,
                ...calculatedOverrideValue,
                formElement: {...state.formElement, values: calculatedValues}
            };

            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputNumberWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={mockValue}
                            handleSubmit={mockHandleSubmit}
                            handleBlur={mockHandleBlur}
                            onChange={mockOnChange}
                            value={calculatedValues[0].raw_value}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const input = screen.getByRole('spinbutton');
            const helperText = screen.getByText(/3.5/);
            expect(input).toHaveValue(calculatedValues[0].raw_value);
            expect(helperText).toBeVisible();
        });
    });
});
