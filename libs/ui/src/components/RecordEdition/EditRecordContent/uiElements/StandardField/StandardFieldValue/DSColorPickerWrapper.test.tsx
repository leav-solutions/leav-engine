// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {fireEvent, render, screen, waitFor, within} from '_ui/_tests/testUtils';
import {DSColorPickerWrapper} from './DSColorPickerWrapper';
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
const pinkColor = 'ff00ff';
const blueColor = '0000ff';
const mockValue = {
    index: 0,
    displayValue: pinkColor,
    editingValue: pinkColor,
    originRawValue: pinkColor,
    idValue: null,
    isEditing: false,
    isErrorDisplayed: false,
    value: {
        id_value: null,
        value: pinkColor,
        raw_value: pinkColor,
        modified_at: null,
        created_at: null,
        created_by: null,
        modified_by: null
    },
    version: null,
    error: '',
    state: StandardFieldValueState.PRISTINE
};

const getInitialState = ({
    required,
    fallbackLang
}: {
    required: boolean;
    fallbackLang: boolean;
}): IStandardFieldReducerState => ({
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
        value: pinkColor,
        raw_value: pinkColor
    },
    {
        isInherited: true,
        value: blueColor,
        raw_value: blueColor
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
        value: pinkColor,
        raw_value: pinkColor
    },
    {
        isCalculated: true,
        value: blueColor,
        raw_value: blueColor
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

describe('DSColorPickerWrapper', () => {
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

    test('Should display colorPicker with fr label', async () => {
        const state = getInitialState({required: false, fallbackLang: false});

        render(
            <AntForm>
                <AntForm.Item>
                    <DSColorPickerWrapper
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

    test('Should display colorPicker with fallback label', async () => {
        const state = getInitialState({required: false, fallbackLang: true});

        render(
            <AntForm>
                <AntForm.Item>
                    <DSColorPickerWrapper
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

    test('Should not submit if field has not changed', async () => {
        const state = getInitialState({required: false, fallbackLang: true});
        render(
            <AntForm>
                <AntForm.Item>
                    <DSColorPickerWrapper
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

        const colorPicker = screen.getByLabelText(en_label);
        await user.click(colorPicker);
        await user.tab();

        expect(mockOnChange).not.toHaveBeenCalled();
        expect(mockHandleSubmit).not.toHaveBeenCalled();
    });

    describe('With required colorPicker and no inheritance', () => {
        test('Should submit the value if field is not empty', async () => {
            const state = getInitialState({required: false, fallbackLang: true});
            render(
                <AntForm>
                    <AntForm.Item>
                        <DSColorPickerWrapper
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

            const colorPicker = screen.getByLabelText(en_label);
            await user.click(colorPicker);

            const input = screen.getByRole('textbox');

            await user.clear(input);
            await user.type(input, pinkColor);
            await user.click(document.body);

            expect(mockHandleSubmit).toHaveBeenCalledWith(pinkColor, state.attribute.id);
            expect(mockOnChange).toHaveBeenCalled();
        });
    });

    describe('With inheritance', () => {
        test("Should display the inherited value by default and not save if we don't change it", async () => {
            let state = getInitialState({required: false, fallbackLang: true});

            state = {
                ...state,
                ...inheritedNotOverrideValue,
                formElement: {...state.formElement, values: inheritedValues}
            };

            render(
                <AntForm>
                    <AntForm.Item>
                        <DSColorPickerWrapper
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

            expect(screen.getByText('#' + inheritedValues[1].raw_value)).toBeVisible();

            const colorPicker = screen.getByLabelText(en_label);
            await user.click(colorPicker);
            await user.click(document.body);

            expect(mockHandleSubmit).not.toHaveBeenCalled();
            expect(mockOnChange).not.toHaveBeenCalled();
        });

        test('Should display the override value in the input and inherited value under it', async () => {
            let state = getInitialState({required: false, fallbackLang: true});

            state = {
                ...state,
                ...inheritedOverrideValue,
                formElement: {...state.formElement, values: inheritedValues}
            };

            render(
                <AntForm>
                    <AntForm.Item>
                        <DSColorPickerWrapper
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

            const inputText = screen.getByText('#' + inheritedValues[0].raw_value);
            expect(inputText).toBeVisible();

            const helperText = screen.getByText(new RegExp(inheritedValues[1].raw_value, 'i'));
            expect(helperText).toBeInTheDocument();
        });

        test("Should allow to clear input when it's override", async () => {
            let state = getInitialState({required: false, fallbackLang: true});

            state = {
                ...state,
                ...inheritedOverrideValue,
                formElement: {...state.formElement, values: inheritedValues}
            };

            render(
                <AntForm>
                    <AntForm.Item>
                        <DSColorPickerWrapper
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

            const colorPicker = screen.getByLabelText(en_label);
            await user.click(colorPicker);

            const clearButton = screen.getByLabelText('clear');
            await user.click(clearButton);

            expect(mockHandleSubmit).toHaveBeenCalledWith('', state.attribute.id);
            expect(screen.queryByText('#00000000')).toBeVisible();
        });
    });

    describe('With calculation', () => {
        test("Should display the calculated value by default and not save if we don't change it", async () => {
            let state = getInitialState({required: false, fallbackLang: true});

            state = {
                ...state,
                ...calculatedNotOverrideValue,
                formElement: {...state.formElement, values: calculatedValues}
            };

            render(
                <AntForm>
                    <AntForm.Item>
                        <DSColorPickerWrapper
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

            expect(screen.getByText('#' + calculatedValues[1].raw_value)).toBeVisible();

            const colorPicker = screen.getByLabelText(en_label);
            await user.click(colorPicker);
            await user.click(document.body);

            expect(mockHandleSubmit).not.toHaveBeenCalled();
            expect(mockOnChange).not.toHaveBeenCalled();
        });

        test('Should display the override value in the input and calculated value under it', async () => {
            let state = getInitialState({required: false, fallbackLang: true});

            state = {
                ...state,
                ...calculatedOverrideValue,
                formElement: {...state.formElement, values: calculatedValues}
            };

            render(
                <AntForm>
                    <AntForm.Item>
                        <DSColorPickerWrapper
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

            const inputText = screen.getByText('#' + calculatedValues[0].raw_value);
            expect(inputText).toBeVisible();

            const helperText = screen.getByText(new RegExp(calculatedValues[1].raw_value, 'i'));
            expect(helperText).toBeInTheDocument();
        });

        test("Should allow to clear input when it's override", async () => {
            let state = getInitialState({required: false, fallbackLang: true});

            state = {
                ...state,
                ...calculatedOverrideValue,
                formElement: {...state.formElement, values: calculatedValues}
            };

            render(
                <AntForm>
                    <AntForm.Item>
                        <DSColorPickerWrapper
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

            const colorPicker = screen.getByLabelText(en_label);
            await user.click(colorPicker);

            const clearButton = screen.getByLabelText('clear');
            await user.click(clearButton);

            expect(mockHandleSubmit).toHaveBeenCalledWith('', state.attribute.id);
        });
    });
});