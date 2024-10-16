// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockBrowserFunctionsForTiptap, render, screen} from '_ui/_tests/testUtils';
import {DSRichTextWrapper} from './DSRichTextWrapper';
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
    displayValue: '<p>my <strong>value</strong></p>',
    editingValue: '<p>my <strong>my raw value</strong></p>',
    originRawValue: '<p>my <strong>my raw value</strong></p>',
    idValue: null,
    isEditing: false,
    isErrorDisplayed: false,
    value: {
        id_value: null,
        value: '<p>my <strong>my value</strong></p>',
        raw_value: '<p>my <strong>my raw value</strong></p>',
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
        value: 'override value',
        raw_value: 'override value'
    },
    {
        isInherited: true,
        value: 'inherited value',
        raw_value: 'inherited value'
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
        value: 'override value',
        raw_value: 'override value'
    },
    {
        isCalculated: true,
        value: 'calculated value',
        raw_value: 'calculated value'
    }
];

const calculatedNotOverrideValue: CalculatedFlags = {
    isCalculatedValue: true,
    isCalculatedOverrideValue: false,
    isCalculatedNotOverrideValue: true,
    calculatedValue: {raw_value: inheritedValues[1].raw_value}
};

const calculatedOverrideValue: CalculatedFlags = {
    isCalculatedValue: true,
    isCalculatedOverrideValue: true,
    isCalculatedNotOverrideValue: false,
    calculatedValue: {raw_value: inheritedValues[1].raw_value}
};

const tiptapCleanup = mockBrowserFunctionsForTiptap();

describe('DSRichTextWrapper', () => {
    afterAll(() => {
        tiptapCleanup();
    });

    const mockHandleSubmit = jest.fn();
    const mockHandleBlur = jest.fn();
    const mockOnChange = jest.fn();
    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({});
        mockOnChange.mockReset();
        mockHandleSubmit.mockReset();
        mockHandleBlur.mockReset();
    });

    test('Should display input with fr label ', async () => {
        const state = getInitialState(false, false);
        render(
            <AntForm>
                <AntForm.Item>
                    <DSRichTextWrapper
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

    test('Should display input with fallback label ', async () => {
        const state = getInitialState(false, true);
        render(
            <AntForm>
                <AntForm.Item>
                    <DSRichTextWrapper
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

    test('Should not submit if value has not changed', async () => {
        const state = getInitialState(false);
        render(
            <AntForm>
                <AntForm.Item>
                    <DSRichTextWrapper
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

        const input = screen.getByRole('textbox');
        await user.click(input);
        await user.click(document.body);

        expect(mockHandleSubmit).not.toHaveBeenCalled();
        expect(mockOnChange).not.toHaveBeenCalled();
    });

    describe('With required input and no inheritance', () => {
        test('Should submit the value if field is not empty', async () => {
            const state = getInitialState(true);
            render(
                <AntForm>
                    <AntForm.Item>
                        <DSRichTextWrapper
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

            const text = 'text';
            const input = screen.getByRole('textbox');
            await user.click(input);
            await user.type(input, text);
            await user.click(document.body);

            expect(mockHandleSubmit).toHaveBeenCalledWith(`<p>${text}</p>`, state.attribute.id);
            expect(mockOnChange).toHaveBeenCalled();
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
                        <DSRichTextWrapper
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

            const input = screen.getByRole('textbox');
            expect(input).toContainHTML(inheritedValues[1].raw_value);

            await user.click(input);
            await user.click(document.body);

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
                        <DSRichTextWrapper
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

            const input = screen.getByRole('textbox');
            const helperText = screen.getByText(/inherited value/);
            expect(input).toContainHTML(inheritedValues[0].raw_value);
            expect(helperText).toBeInTheDocument();
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
                        <DSRichTextWrapper
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

            const input = screen.getByRole('textbox');
            expect(input).toContainHTML(calculatedValues[1].raw_value);

            await user.click(input);
            await user.click(document.body);

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
                        <DSRichTextWrapper
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

            const input = screen.getByRole('textbox');
            const helperText = screen.getByText(/calculated value/);
            expect(input).toContainHTML(calculatedValues[0].raw_value);
            expect(helperText).toBeInTheDocument();
        });
    });
});
