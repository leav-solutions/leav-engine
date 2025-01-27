// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {DSInputWrapper} from './DSInputWrapper';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import userEvent from '@testing-library/user-event';
import {AntForm} from 'aristid-ds';
import {CalculatedFlags, InheritedFlags} from '../calculatedInheritedFlags';

const value = 'Half-blood prince';
const presentationValue = 'Severus Snape';
const newValue = 'Harry Potter';

const calculatedFlagsWithoutCalculatedValue: CalculatedFlags = {
    isCalculatedValue: false,
    isCalculatedOverrideValue: false,
    isCalculatedNotOverrideValue: false,
    calculatedValue: null
};

const calculatedFlagsWithCalculatedValue: CalculatedFlags = {
    isCalculatedValue: true,
    isCalculatedOverrideValue: true,
    isCalculatedNotOverrideValue: false,
    calculatedValue: {
        raw_payload: newValue
    }
};

const inheritedFlagsWithoutInheritedValue: InheritedFlags = {
    isInheritedValue: false,
    isInheritedOverrideValue: false,
    isInheritedNotOverrideValue: false,
    inheritedValue: null
};

const inheritedFlagsWithInheritedValue: InheritedFlags = {
    isInheritedValue: true,
    isInheritedOverrideValue: true,
    isInheritedNotOverrideValue: false,
    inheritedValue: {
        raw_payload: newValue
    }
};

const notRequired = false;
const notReadonly = false;
const readonly = true;

describe('DSInputWrapper', () => {
    const mockHandleSubmit = jest.fn();
    const mockOnChange = jest.fn();
    const mockSetActiveValue = jest.fn();

    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({});
        mockOnChange.mockReset();
        mockHandleSubmit.mockReset();
        mockSetActiveValue.mockReset();
    });

    test('Should display the presentationValue', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputWrapper
                        value={value}
                        presentationValue={presentationValue}
                        attribute={mockFormAttribute}
                        required={notRequired}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                        setActiveValue={mockSetActiveValue}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const input = screen.getByRole('textbox');
        expect(input).toHaveValue(presentationValue);
    });

    test('Should display the value if presentationValue is empty', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputWrapper
                        value={value}
                        attribute={mockFormAttribute}
                        required={notRequired}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                        setActiveValue={mockSetActiveValue}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const input = screen.getByRole('textbox');
        expect(input).toHaveValue(value);
    });

    test('Should display the value if focused', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputWrapper
                        value={value}
                        presentationValue={presentationValue}
                        attribute={mockFormAttribute}
                        required={notRequired}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                        setActiveValue={mockSetActiveValue}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const input = screen.getByRole('textbox');
        await user.click(input);
        expect(input).toHaveValue(value);
    });

    test('Should be disabled when readonly', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputWrapper
                        value={value}
                        presentationValue={presentationValue}
                        attribute={mockFormAttribute}
                        required={notRequired}
                        readonly={readonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                        setActiveValue={mockSetActiveValue}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const input = screen.getByRole('textbox');
        expect(input).toBeDisabled();
    });

    test('Should call handleSubmit on blur with new value', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputWrapper
                        attribute={mockFormAttribute}
                        required={notRequired}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                        setActiveValue={mockSetActiveValue}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const input = screen.getByRole('textbox');

        await user.click(input);
        await user.type(input, newValue);
        await user.tab();

        expect(mockOnChange).toHaveBeenCalled();
        expect(mockHandleSubmit).toHaveBeenCalledWith(newValue, mockFormAttribute.id);
    });

    test('Should call setActiveValue if focused', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputWrapper
                        attribute={mockFormAttribute}
                        required={notRequired}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                        setActiveValue={mockSetActiveValue}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const input = screen.getByRole('textbox');
        await user.click(input);

        expect(mockSetActiveValue).toHaveBeenCalled();
    });

    describe('Without inherited or calculated flags', () => {
        test('Should submit null on clear', async () => {
            render(
                <AntForm initialValues={{inputToTest: value}}>
                    <AntForm.Item name="inputToTest">
                        <DSInputWrapper
                            attribute={mockFormAttribute}
                            required={notRequired}
                            readonly={notReadonly}
                            calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                            inheritedFlags={inheritedFlagsWithoutInheritedValue}
                            handleSubmit={mockHandleSubmit}
                            onChange={mockOnChange}
                            setActiveValue={mockSetActiveValue}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const clearIcon = screen.getByLabelText('clear');
            await user.click(clearIcon);

            expect(mockOnChange).toHaveBeenCalled();
            expect(mockHandleSubmit).toHaveBeenCalledWith(null, mockFormAttribute.id);
        });
    });

    describe('With inherited or calculated value', () => {
        it.each`
            calculatedValue | inheritedValue
            ${'calculated'} | ${null}
            ${null}         | ${'inherited'}
            ${'calculated'} | ${'inherited'}
        `(
            'Should submit empty value on clear and call onChange with inherited value',
            async ({
                calculatedValue,
                inheritedValue
            }: {
                calculatedValue: string | null;
                inheritedValue: string | null;
            }) => {
                render(
                    <AntForm initialValues={{inputTest: value}}>
                        <AntForm.Item name="inputTest">
                            <DSInputWrapper
                                value={value}
                                attribute={mockFormAttribute}
                                required={notRequired}
                                readonly={notReadonly}
                                calculatedFlags={
                                    calculatedValue
                                        ? calculatedFlagsWithCalculatedValue
                                        : calculatedFlagsWithoutCalculatedValue
                                }
                                inheritedFlags={
                                    inheritedValue
                                        ? inheritedFlagsWithInheritedValue
                                        : inheritedFlagsWithoutInheritedValue
                                }
                                handleSubmit={mockHandleSubmit}
                                onChange={mockOnChange}
                                setActiveValue={mockSetActiveValue}
                            />
                        </AntForm.Item>
                    </AntForm>
                );

                const clearIcon = screen.getByLabelText('clear');
                await user.click(clearIcon);

                expect(mockOnChange).toHaveBeenCalledWith(newValue);
                expect(mockHandleSubmit).toHaveBeenCalledWith(null, mockFormAttribute.id);
            }
        );
    });
});
