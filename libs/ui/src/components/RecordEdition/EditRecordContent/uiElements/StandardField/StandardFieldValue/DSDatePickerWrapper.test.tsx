import {render, screen} from '_ui/_tests/testUtils';
import {DSDatePickerWrapper} from './DSDatePickerWrapper';
import userEvent from '@testing-library/user-event';
import {Form} from 'antd';
import dayjs from 'dayjs';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {type CalculatedFlags, type InheritedFlags} from '../../shared/calculatedInheritedFlags';

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
    isCalculatedValues: false,
    isCalculatedOverrideValues: false,
    isCalculatedNotOverrideValues: false,
    calculatedValues: null,
};

const calculatedFlagsWithCalculatedValue: CalculatedFlags = {
    isCalculatedValues: true,
    isCalculatedOverrideValues: true,
    isCalculatedNotOverrideValues: false,
    calculatedValues: [
        {
            raw_payload: firstDayOfMonthDateTimestamp,
        },
    ],
};

const inheritedFlagsWithoutInheritedValue: InheritedFlags = {
    isInheritedValues: false,
    isInheritedOverrideValues: false,
    isInheritedNotOverrideValues: false,
    inheritedValues: null,
};

const inheritedFlagsWithInheritedValue: InheritedFlags = {
    isInheritedValues: true,
    isInheritedOverrideValues: true,
    isInheritedNotOverrideValues: false,
    inheritedValues: [
        {
            raw_payload: firstDayOfMonthDateTimestamp,
        },
    ],
};

const notReadonly = false;
const readonly = true;

describe('DSDatePickerWrapper', () => {
    const mockOnChange = vi.fn();
    const mockHandleSubmit = vi.fn();
    const mockHandleBlur = vi.fn();
    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({
            // happy-dom computes pointer-events:none on antd hover-revealed controls (e.g. the picker
            // clear icon), which are only clickable on :hover in a real browser. Disable the check.
            pointerEventsCheck: 0,
        });
        mockOnChange.mockReset();
        mockHandleSubmit.mockReset();
        mockHandleBlur.mockReset();
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
                    />
                </Form.Item>
            </Form>,
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
                    />
                </Form.Item>
            </Form>,
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
                    />
                </Form.Item>
            </Form>,
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
                    />
                </Form.Item>
            </Form>,
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
                    />
                </Form.Item>
            </Form>,
        );

        const datePicker = screen.getByRole('textbox');

        await user.click(datePicker);
        const dayToSelect = await screen.findAllByText(firstDayOfMonthDate.date());
        await user.click(dayToSelect[0]);

        expect(mockOnChange).toHaveBeenCalledWith(firstDayOfMonthDateAtNoon, firstDayOfMonthDateFormatted);
        expect(mockHandleSubmit).toHaveBeenCalledWith(
            firstDayOfMonthDateAtNoon.unix().toString(),
            mockFormAttribute.id,
        );
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
                    />
                </Form.Item>
            </Form>,
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
                        datePickerTest: firstDayOfMonthDate,
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
                        />
                    </Form.Item>
                </Form>,
            );

            const clearButton = screen.getByRole('button');
            await user.click(clearButton);

            expect(mockOnChange).toHaveBeenCalledTimes(1);
            expect(mockOnChange).toHaveBeenCalledWith(
                expect.any(Object),
                inheritedFlagsWithInheritedValue.inheritedValues[0].raw_payload,
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
                        />
                    </Form.Item>
                </Form>,
            );

            expect(screen.queryByRole('button')).toBeNull();
        });
    });

    describe('Calculated values', () => {
        test('Should call onChange/handleSubmit with empty value on clear', async () => {
            render(
                <Form
                    initialValues={{
                        datePickerTest: firstDayOfMonthDate,
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
                        />
                    </Form.Item>
                </Form>,
            );

            const clearButton = screen.getByRole('button');
            await user.click(clearButton);

            expect(mockOnChange).toHaveBeenCalledTimes(1);
            expect(mockOnChange).toHaveBeenCalledWith(
                expect.any(Object),
                calculatedFlagsWithCalculatedValue.calculatedValues[0].raw_payload,
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
                        />
                    </Form.Item>
                </Form>,
            );

            expect(screen.queryByRole('button')).toBeNull();
        });
    });
});
