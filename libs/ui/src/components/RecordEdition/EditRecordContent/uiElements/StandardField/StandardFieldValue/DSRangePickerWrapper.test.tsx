// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {DSRangePickerWrapper} from './DSRangePickerWrapper';
import userEvent from '@testing-library/user-event';
import {Form} from 'antd';
import dayjs from 'dayjs';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {CalculatedFlags, InheritedFlags} from '../../shared/calculatedInheritedFlags';

const todayDate = dayjs();
const tomorrowDate = dayjs().add(1, 'day');
const formatedDates = (date: dayjs.Dayjs) => ({
    formated: date.format('YYYY-MM-DD'),
    timestamp: date.unix().toString(),
    atNoon: date.set('hour', 12).set('minute', 0).set('second', 0).set('millisecond', 0),
    atNoonTimestamp: date.set('hour', 12).set('minute', 0).set('second', 0).set('millisecond', 0).unix()
});
const todayDateFormated = formatedDates(todayDate);
const tomorrowDateFormated = formatedDates(tomorrowDate);

const presentationDate = 'From December 05, 2024 To December 06, 2024';

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
        raw_payload: {from: todayDateFormated.timestamp, to: tomorrowDateFormated.timestamp}
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
        raw_payload: {from: todayDateFormated.timestamp, to: tomorrowDateFormated.timestamp}
    }
};

const notReadonly = false;
const readonly = true;

describe('DSRangePickerWrapper', () => {
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
                    <DSRangePickerWrapper
                        value={[todayDate, tomorrowDate]}
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

        expect(screen.getAllByRole('textbox')[0]).toHaveValue(presentationDate);
    });

    test('Should display the value if focused', async () => {
        render(
            <Form>
                <Form.Item>
                    <DSRangePickerWrapper
                        value={[todayDate, tomorrowDate]}
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

        const textInput = screen.getAllByRole('textbox')[0];
        await user.click(textInput);
        const rangePickerInputs = screen.getAllByRole('textbox');
        expect(rangePickerInputs[0]).toHaveValue(todayDateFormated.formated);
        expect(rangePickerInputs[1]).toHaveValue(tomorrowDateFormated.formated);
    });

    test('Should be disabled when readonly', async () => {
        render(
            <Form>
                <Form.Item>
                    <DSRangePickerWrapper
                        value={[todayDate, tomorrowDate]}
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

        expect(screen.getAllByRole('textbox')[0]).toBeDisabled();
    });

    test('Should call onChange / handleSubmit with value at noon', async () => {
        render(
            <Form>
                <Form.Item>
                    <DSRangePickerWrapper
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

        const textInput = screen.getAllByRole('textbox')[0];
        await user.click(textInput);

        await user.click(screen.getAllByTitle(todayDateFormated.formated)[0]);
        await user.click(screen.getAllByTitle(tomorrowDateFormated.formated)[0]);

        expect(mockOnChange).toHaveBeenCalledWith(
            [todayDateFormated.atNoon, tomorrowDateFormated.atNoon],
            [todayDateFormated.formated, tomorrowDateFormated.formated]
        );

        expect(mockHandleSubmit).toHaveBeenCalledWith(
            JSON.stringify({
                from: todayDateFormated.atNoonTimestamp,
                to: tomorrowDateFormated.atNoonTimestamp
            }),
            mockFormAttribute.id
        );
    });

    test('Should save to LEAV if field becomes empty', async () => {
        render(
            <Form>
                <Form.Item name="datePickerTest">
                    <DSRangePickerWrapper
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

        const textInput = screen.getAllByRole('textbox')[0];
        await user.click(textInput);

        const rangePickerInputs = screen.getAllByRole('textbox');
        await user.click(rangePickerInputs[0]);
        await user.click(screen.getAllByTitle(todayDateFormated.formated)[0]);
        await user.click(screen.getAllByTitle(tomorrowDateFormated.formated)[0]);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(mockHandleSubmit).toHaveBeenCalledTimes(1);

        const clearIcon = screen.getByLabelText('clear');
        await user.click(clearIcon);

        expect(mockOnChange).toHaveBeenCalledTimes(2);
        expect(mockHandleSubmit).toHaveBeenCalledTimes(2);
    });

    test('Should call setActiveValue if focused', async () => {
        render(
            <Form>
                <Form.Item>
                    <DSRangePickerWrapper
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

        const textInput = screen.getAllByRole('textbox')[0];
        await user.click(textInput);

        expect(mockSetActiveValue).toHaveBeenCalledTimes(1);
    });

    describe('Inherited values', () => {
        test('Should call onChange/handleSubmit with empty value on clear', async () => {
            render(
                <Form
                    initialValues={{
                        rangePickerTest: [todayDate, tomorrowDate]
                    }}
                >
                    <Form.Item name="rangePickerTest">
                        <DSRangePickerWrapper
                            value={[todayDate, tomorrowDate]}
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
                    <Form.Item name="rangePickerTest">
                        <DSRangePickerWrapper
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
                        rangePickerTest: todayDate
                    }}
                >
                    <Form.Item name="rangePickerTest">
                        <DSRangePickerWrapper
                            value={[todayDate, tomorrowDate]}
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
                    <Form.Item name="rangePickerTest">
                        <DSRangePickerWrapper
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
