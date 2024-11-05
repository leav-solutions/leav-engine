// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {DSInputEncryptedWrapper} from './DSInputEncryptedWrapper';
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
import {RecordFormElementsValueStandardValue} from '_ui/hooks/useGetRecordForm';

const en_label = 'label';
const fr_label = 'libellé';
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

const inheritedValues: RecordFormElementsValueStandardValue[] = [
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

const calculatedValues: RecordFormElementsValueStandardValue[] = [
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
    calculatedValue: {raw_value: calculatedValues[1].raw_value}
};

const calculatedOverrideValue: CalculatedFlags = {
    isCalculatedValue: true,
    isCalculatedOverrideValue: true,
    isCalculatedNotOverrideValue: false,
    calculatedValue: {raw_value: calculatedValues[1].raw_value}
};

describe('DSInputEncryptedWrapper', () => {
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

    test('Should display input with fr label ', async () => {
        const state = getInitialState({required: false, fallbackLang: false});
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputEncryptedWrapper
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
        const state = getInitialState({required: false, fallbackLang: true});
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputEncryptedWrapper
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
        const state = getInitialState({required: false, fallbackLang: false});
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputEncryptedWrapper
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

        // TODO : change testid with click on label when https://aristid.atlassian.net/browse/DS-174 is done
        const input = screen.getByTestId('kit-input-password');
        await user.click(input);
        await user.tab();

        expect(mockHandleSubmit).not.toHaveBeenCalledWith();
        expect(mockOnChange).not.toHaveBeenCalled();
    });

    describe('With required input and no inheritance', () => {
        test('Should submit the value if field is not empty', async () => {
            const state = getInitialState({required: true, fallbackLang: false});
            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputEncryptedWrapper
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
            const input = screen.getByTestId('kit-input-password');
            await user.click(input);
            await user.type(input, text);
            await user.tab();

            expect(mockHandleSubmit).toHaveBeenCalledWith(text, state.attribute.id);
            expect(mockOnChange).toHaveBeenCalled();
        });
    });

    describe('With inheritance', () => {
        test("Should display the inherited value by default and not save if we don't change it", async () => {
            let state = getInitialState({required: false, fallbackLang: false});
            state = {
                ...state,
                ...inheritedNotOverrideValue,
                formElement: {...state.formElement, values: inheritedValues}
            };
            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputEncryptedWrapper
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
            const input = screen.getByTestId('kit-input-password');
            expect(input).toHaveValue(inheritedValues[1].raw_value);

            expect(screen.queryByRole('button')).toBeNull();

            await user.click(input);
            await user.tab();

            expect(mockHandleSubmit).not.toHaveBeenCalled();
        });

        test('Should display the override value in the input and inherited value under it', async () => {
            let state = getInitialState({required: false, fallbackLang: false});
            state = {
                ...state,
                ...inheritedOverrideValue,
                formElement: {...state.formElement, values: inheritedValues}
            };

            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputEncryptedWrapper
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

            const input = screen.getByTestId('kit-input-password');
            const helperText = screen.getByText(/inherited value/);
            expect(input).toHaveValue(inheritedValues[0].raw_value);
            expect(helperText).toBeInTheDocument();
        });

        test("Should allow to clear input when it's override", async () => {
            let state = getInitialState({required: false, fallbackLang: false});
            state = {
                ...state,
                ...inheritedOverrideValue,
                formElement: {...state.formElement, values: inheritedValues}
            };
            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputEncryptedWrapper
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
            const clearButton = screen.getByRole('button');

            await user.click(clearButton);

            expect(mockHandleSubmit).toHaveBeenCalledWith('', state.attribute.id);
        });
    });

    describe('With calculation', () => {
        test("Should display the calculated value by default and not save if we don't change it", async () => {
            let state = getInitialState({required: false, fallbackLang: false});
            state = {
                ...state,
                ...calculatedNotOverrideValue,
                formElement: {...state.formElement, values: calculatedValues}
            };
            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputEncryptedWrapper
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
            const input = screen.getByTestId('kit-input-password');
            expect(input).toHaveValue(calculatedValues[1].raw_value);

            expect(screen.queryByRole('button')).toBeNull();

            await user.click(input);
            await user.tab();

            expect(mockHandleSubmit).not.toHaveBeenCalled();
        });

        test('Should display the override value in the input and calculated value under it', async () => {
            let state = getInitialState({required: false, fallbackLang: false});
            state = {
                ...state,
                ...calculatedOverrideValue,
                formElement: {...state.formElement, values: calculatedValues}
            };

            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputEncryptedWrapper
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

            const input = screen.getByTestId('kit-input-password');
            const helperText = screen.getByText(/calculated value/);
            expect(input).toHaveValue(calculatedValues[0].raw_value);
            expect(helperText).toBeInTheDocument();
        });

        test("Should allow to clear input when it's override", async () => {
            let state = getInitialState({required: false, fallbackLang: false});
            state = {
                ...state,
                ...calculatedOverrideValue,
                formElement: {...state.formElement, values: calculatedValues}
            };
            render(
                <AntForm>
                    <AntForm.Item>
                        <DSInputEncryptedWrapper
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
            const clearButton = screen.getByRole('button');

            await user.click(clearButton);

            expect(mockHandleSubmit).toHaveBeenCalledWith('', state.attribute.id);
        });
    });
});
