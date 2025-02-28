// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {DSInputNumberWrapper} from './DSInputNumberWrapper';
import userEvent from '@testing-library/user-event';
import {AntForm} from 'aristid-ds';
import {CalculatedFlags, InheritedFlags} from '../calculatedInheritedFlags';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';

const value = '42';
const presentationValue = 'The answer to life, the universe and everything';
const dartMaxScore = '180';

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
        raw_payload: dartMaxScore
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
        raw_payload: dartMaxScore
    }
};

const notReadonly = false;
const readonly = true;

describe('DSInputNumberWrapper', () => {
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
                    <DSInputNumberWrapper
                        value={value}
                        presentationValue={presentationValue}
                        attribute={mockFormAttribute}
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

        const inputNumber = screen.getByRole('spinbutton');
        expect(inputNumber).toHaveValue(presentationValue);
    });

    test('Should display the value if presentationValue is empty', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputNumberWrapper
                        value={value}
                        attribute={mockFormAttribute}
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

        const inputNumber = screen.getByRole('spinbutton');
        expect(inputNumber).toHaveValue(value);
    });

    test('Should display the value if focused', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputNumberWrapper
                        value={value}
                        presentationValue={presentationValue}
                        attribute={mockFormAttribute}
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

        const inputNumber = screen.getByRole('spinbutton');
        await user.click(inputNumber);
        expect(inputNumber).toHaveValue(value);
    });

    test('Should be disabled when readonly', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputNumberWrapper
                        value={value}
                        presentationValue={presentationValue}
                        attribute={mockFormAttribute}
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

        const inputNumber = screen.getByRole('spinbutton');
        expect(inputNumber).toBeDisabled();
    });

    test('Should call handleSubmit on blur with new value', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputNumberWrapper
                        attribute={mockFormAttribute}
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

        const inputNumber = screen.getByRole('spinbutton');

        await user.click(inputNumber);
        await user.type(inputNumber, dartMaxScore);
        await user.tab();

        expect(mockOnChange).toHaveBeenCalled();
        expect(mockHandleSubmit).toHaveBeenCalledWith(dartMaxScore, mockFormAttribute.id);
    });

    test('Should call setActiveValue if focused', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputNumberWrapper
                        value={value}
                        attribute={mockFormAttribute}
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

        const inputNumber = screen.getByRole('spinbutton');

        await user.click(inputNumber);

        expect(mockSetActiveValue).toHaveBeenCalled();
    });

    describe('Without inherited or calculated flags', () => {
        test('Should submit empty value on clear', async () => {
            render(
                <AntForm initialValues={{inputNumberTest: value}}>
                    <AntForm.Item name="inputNumberTest">
                        <DSInputNumberWrapper
                            attribute={mockFormAttribute}
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

            const inputNumber = screen.getByRole('spinbutton');

            await user.click(inputNumber);
            await user.clear(inputNumber);
            await user.tab();

            expect(mockOnChange).toHaveBeenCalled();
            expect(mockHandleSubmit).toHaveBeenCalledWith('', mockFormAttribute.id);
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
                    <AntForm initialValues={{inputNumberTest: value}}>
                        <AntForm.Item name="inputNumberTest">
                            <DSInputNumberWrapper
                                value={value}
                                attribute={mockFormAttribute}
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

                const input = screen.getByRole('spinbutton');

                await user.clear(input);
                await user.tab();

                expect(mockOnChange).toHaveBeenCalledWith(dartMaxScore);
                expect(mockHandleSubmit).toHaveBeenCalledWith(null, mockFormAttribute.id);
            }
        );
    });
});
