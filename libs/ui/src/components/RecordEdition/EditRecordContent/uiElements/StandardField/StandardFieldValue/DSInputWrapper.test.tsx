// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {DSInputWrapper} from './DSInputWrapper';
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

const en_label = 'label';
const fr_label = 'libellé';
const idValue = '123';
const mockValue = {
    index: 0,
    displayValue: 'my value',
    editingValue: 'my raw value',
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

describe('DSInputWrapper', () => {
    const mockHandleSubmit = jest.fn();
    const mockOnChange = jest.fn();

    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({});
        mockOnChange.mockReset();
        mockHandleSubmit.mockReset();
    });

    test('Should display the presentationValue', async () => {
        const presentationValue = 'presentationValue';
        const state = getInitialState(false);
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputWrapper
                        state={state}
                        presentationValue={presentationValue}
                        attribute={{} as RecordFormAttributeFragment}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const input = screen.getByRole('textbox');
        expect(input).toHaveValue(presentationValue);
    });

    test('Should display the value on focus', async () => {
        const presentationValue = 'presentationValue';
        const value = '42';
        const state = getInitialState(false);
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputWrapper
                        state={state}
                        presentationValue={presentationValue}
                        attribute={{} as RecordFormAttributeFragment}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                        value={value}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const input = screen.getByRole('textbox');
        await user.click(input);
        expect(input).toHaveValue(value);
    });

    test('Should call handleSubmit on blur with new value', async () => {
        const state = getInitialState(false);
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputWrapper
                        state={state}
                        presentationValue=""
                        attribute={{} as RecordFormAttributeFragment}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const newValue = '72';
        const input = screen.getByRole('textbox');

        await user.click(input);
        await user.type(input, newValue);
        await user.tab();

        expect(mockOnChange).toHaveBeenCalled();
        expect(mockHandleSubmit).toHaveBeenCalledWith(newValue, state.attribute.id);
    });

    describe('Without inherited or calculated flags', () => {
        test('Should submit empty value on clear', async () => {
            const state = getInitialState(false);
            render(
                <AntForm initialValues={{danette: '42'}}>
                    <AntForm.Item name="danette">
                        <DSInputWrapper
                            state={state}
                            presentationValue=""
                            attribute={{} as RecordFormAttributeFragment}
                            handleSubmit={mockHandleSubmit}
                            onChange={mockOnChange}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const clearIcon = screen.getByLabelText('clear');
            await user.click(clearIcon);

            expect(mockOnChange).toHaveBeenCalled();
            expect(mockHandleSubmit).toHaveBeenCalledWith('', state.attribute.id);
        });
    });

    describe('With inherited or calculated value', () => {
        it.each`
            calculatedValue | inheritedValue | onChangeValue
            ${'calculated'} | ${null}        | ${'calculated'}
            ${null}         | ${'inherited'} | ${'inherited'}
            ${'calculated'} | ${'inherited'} | ${'inherited'}
        `(
            'Should submit empty value on clear and call onChange with inherited value',
            async ({
                calculatedValue,
                inheritedValue,
                onChangeValue
            }: {
                calculatedValue: string | null;
                inheritedValue: string | null;
                onChangeValue: string;
            }) => {
                const state = getInitialState(false);
                render(
                    <AntForm initialValues={{danette: '42'}}>
                        <AntForm.Item name="danette">
                            <DSInputWrapper
                                state={
                                    {
                                        ...state,
                                        isInheritedValue: !!inheritedValue,
                                        inheritedValue: {raw_payload: inheritedValue},
                                        isCalculatedValue: !!calculatedValue,
                                        calculatedValue: {raw_payload: calculatedValue}
                                    } as any
                                }
                                presentationValue=""
                                attribute={{} as RecordFormAttributeFragment}
                                handleSubmit={mockHandleSubmit}
                                onChange={mockOnChange}
                            />
                        </AntForm.Item>
                    </AntForm>
                );

                const clearIcon = screen.getByLabelText('clear');
                await user.click(clearIcon);

                expect(mockOnChange).toHaveBeenCalledWith(onChangeValue);
                expect(mockHandleSubmit).toHaveBeenCalledWith('', state.attribute.id);
            }
        );
    });
});
