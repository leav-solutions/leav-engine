// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {DSDatePickerWrapper} from './DSDatePickerWrapper';
import userEvent from '@testing-library/user-event';
import {Form} from 'antd';
import dayjs from 'dayjs';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {CalculatedFlags, InheritedFlags} from '../../shared/calculatedInheritedFlags';

const firstDayOfMonthDate = dayjs().startOf('month');
const firstDayOfMonthDateFormatted = firstDayOfMonthDate.format('YYYY-MM-DD');
const firstDayOfMonthDateTimestamp = firstDayOfMonthDate.unix().toString();
const firstDayOfMonthDateAtNoon = firstDayOfMonthDate
    .set('hour', 12)
    .set('minute', 0)
    .set('second', 0)
    .set('millisecond', 0);
const presentationDate = 'December 05, 2024';

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
        raw_payload: firstDayOfMonthDateTimestamp
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
        raw_payload: firstDayOfMonthDateTimestamp
    }
};

const notRequired = false;
const notReadonly = false;
const readonly = true;

describe('DSDatePickerWrapper', () => {
    const mockOnChange = jest.fn();
    const mockHandleSubmit = jest.fn();
    const mockHandleBlur = jest.fn();
    const mockSetActiveValue = jest.fn();
    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({});
        mockOnChange.mockReset();
        mockHandleSubmit.mockReset();
        mockHandleBlur.mockReset();
        mockSetActiveValue.mockReset();
    });

    test('Should display presentationValue By default', async () => {
        render(
            <Form>
                <Form.Item>
                    <DSDatePickerWrapper
                        value={firstDayOfMonthDate}
                        presentationValue={presentationDate}
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        onChange={mockOnChange}
                        handleSubmit={mockHandleSubmit}
                        setActiveValue={mockSetActiveValue}
                    />
                </Form.Item>
            </Form>
        );

        expect(screen.getByRole('textbox')).toHaveValue(presentationDate);
    });

    test('Should display the value if presentationValue is empty', async () => {
        render(
            <Form>
                <Form.Item>
                    <DSDatePickerWrapper
                        value={firstDayOfMonthDate}
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        onChange={mockOnChange}
                        handleSubmit={mockHandleSubmit}
                        setActiveValue={mockSetActiveValue}
                    />
                </Form.Item>
            </Form>
        );

        expect(screen.getByRole('textbox')).toHaveValue(firstDayOfMonthDateFormatted);
    });

    test('Should display the value if focused', async () => {
        render(
            <Form>
                <Form.Item>
                    <DSDatePickerWrapper
                        value={firstDayOfMonthDate}
                        presentationValue={presentationDate}
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        onChange={mockOnChange}
                        handleSubmit={mockHandleSubmit}
                        setActiveValue={mockSetActiveValue}
                    />
                </Form.Item>
            </Form>
        );

        await user.click(screen.getByRole('textbox'));

        expect(screen.getByRole('textbox')).toHaveValue(firstDayOfMonthDateFormatted);
    });

    test('Should be disabled when readonly', async () => {
        render(
            <Form>
                <Form.Item>
                    <DSDatePickerWrapper
                        value={firstDayOfMonthDate}
                        presentationValue={presentationDate}
                        attribute={mockFormAttribute}
                        readonly={readonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        onChange={mockOnChange}
                        handleSubmit={mockHandleSubmit}
                        setActiveValue={mockSetActiveValue}
                    />
                </Form.Item>
            </Form>
        );

        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    test('Should call onChange / handleSubmit with value at noon', async () => {
        render(
            <Form>
                <Form.Item>
                    <DSDatePickerWrapper
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        onChange={mockOnChange}
                        handleSubmit={mockHandleSubmit}
                        setActiveValue={mockSetActiveValue}
                    />
                </Form.Item>
            </Form>
        );

        const datePicker = screen.getByRole('textbox');

        await user.click(datePicker);
        const dayToSelect = await screen.findAllByText(firstDayOfMonthDate.date());
        await user.click(dayToSelect[0]);

        expect(mockOnChange).toHaveBeenCalledWith(firstDayOfMonthDateAtNoon, firstDayOfMonthDateFormatted);
        expect(mockHandleSubmit).toHaveBeenCalledWith(
            firstDayOfMonthDateAtNoon.unix().toString(),
            mockFormAttribute.id
        );
    });

    test('Should call setActiveValue if focused', async () => {
        render(
            <Form>
                <Form.Item>
                    <DSDatePickerWrapper
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        onChange={mockOnChange}
                        handleSubmit={mockHandleSubmit}
                        setActiveValue={mockSetActiveValue}
                    />
                </Form.Item>
            </Form>
        );

        await user.click(screen.getByRole('textbox'));

        expect(mockSetActiveValue).toHaveBeenCalled();
    });

    test('Should save to LEAV if field becomes empty', async () => {
        render(
            <Form>
                <Form.Item name="datePickerTest">
                    <DSDatePickerWrapper
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        onChange={mockOnChange}
                        handleSubmit={mockHandleSubmit}
                        setActiveValue={mockSetActiveValue}
                    />
                </Form.Item>
            </Form>
        );

        await user.click(screen.getByRole('textbox'));
        const dayToSelect = await screen.findAllByText(firstDayOfMonthDate.date());
        await user.click(dayToSelect[0]);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(mockHandleSubmit).toHaveBeenCalledTimes(1);

        const clearButton = screen.getByRole('button');
        await user.click(clearButton);

        expect(mockOnChange).toHaveBeenCalledTimes(2);
        expect(mockHandleSubmit).toHaveBeenCalledTimes(2);
    });

    describe('Inherited values', () => {
        test('Should call onChange/handleSubmit with empty value on clear', async () => {
            render(
                <Form
                    initialValues={{
                        datePickerTest: firstDayOfMonthDate
                    }}
                >
                    <Form.Item name="datePickerTest">
                        <DSDatePickerWrapper
                            value={firstDayOfMonthDate}
                            presentationValue={presentationDate}
                            attribute={mockFormAttribute}
                            readonly={notReadonly}
                            calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                            inheritedFlags={inheritedFlagsWithInheritedValue}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                            setActiveValue={mockSetActiveValue}
                        />
                    </Form.Item>
                </Form>
            );

            const clearButton = screen.getByRole('button');
            await user.click(clearButton);

            expect(mockOnChange).toHaveBeenCalledTimes(1);
            expect(mockOnChange).toHaveBeenCalledWith(
                expect.any(Object),
                inheritedFlagsWithInheritedValue.inheritedValue.raw_payload
            );
            expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
            expect(mockHandleSubmit).toHaveBeenCalledWith(null, mockFormAttribute.id);
        });

        test('Should hide clear icon when value is inherited, but not override', async () => {
            render(
                <Form>
                    <Form.Item name="datePickerTest">
                        <DSDatePickerWrapper
                            attribute={mockFormAttribute}
                            readonly={notReadonly}
                            calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                            inheritedFlags={inheritedFlagsWithInheritedValue}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                            setActiveValue={mockSetActiveValue}
                        />
                    </Form.Item>
                </Form>
            );

            expect(screen.queryByRole('button')).toBeNull();
        });
    });

    describe('Calculated values', () => {
        test('Should call onChange/handleSubmit with empty value on clear', async () => {
            render(
                <Form
                    initialValues={{
                        datePickerTest: firstDayOfMonthDate
                    }}
                >
                    <Form.Item name="datePickerTest">
                        <DSDatePickerWrapper
                            value={firstDayOfMonthDate}
                            presentationValue={presentationDate}
                            attribute={mockFormAttribute}
                            readonly={notReadonly}
                            calculatedFlags={calculatedFlagsWithCalculatedValue}
                            inheritedFlags={inheritedFlagsWithoutInheritedValue}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                            setActiveValue={mockSetActiveValue}
                        />
                    </Form.Item>
                </Form>
            );

            const clearButton = screen.getByRole('button');
            await user.click(clearButton);

            expect(mockOnChange).toHaveBeenCalledTimes(1);
            expect(mockOnChange).toHaveBeenCalledWith(
                expect.any(Object),
                calculatedFlagsWithCalculatedValue.calculatedValue.raw_payload
            );
            expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
            expect(mockHandleSubmit).toHaveBeenCalledWith(null, mockFormAttribute.id);
        });

        test('Should hide clear icon when value is calculated, but not override', async () => {
            render(
                <Form>
                    <Form.Item name="datePickerTest">
                        <DSDatePickerWrapper
                            attribute={mockFormAttribute}
                            readonly={notReadonly}
                            calculatedFlags={calculatedFlagsWithCalculatedValue}
                            inheritedFlags={inheritedFlagsWithoutInheritedValue}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                            setActiveValue={mockSetActiveValue}
                        />
                    </Form.Item>
                </Form>
            );

            expect(screen.queryByRole('button')).toBeNull();
        });
    });
});
