import {render, screen, waitFor} from '_ui/_tests/testUtils';
import {DSRangePickerWrapper} from './DSRangePickerWrapper';
import userEvent from '@testing-library/user-event';
import {Form} from 'antd';
import dayjs from 'dayjs';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {type CalculatedFlags, type InheritedFlags} from '../../shared/calculatedInheritedFlags';
import {LangContext} from '_ui/contexts';

const enLangContext = {lang: ['en'], availableLangs: ['fr', 'en'], defaultLang: 'en', setLang: () => undefined};

const todayDate = dayjs();
const tomorrowDate = dayjs().add(1, 'day');
const formatedDates = (date: dayjs.Dayjs) => ({
    formated: date.format('DD/MM/YYYY'),
    formatedEn: date.format('MM/DD/YYYY'),
    titleFormated: date.format('YYYY-MM-DD'),
    timestamp: date.unix().toString(),
    atNoon: date.set('hour', 12).set('minute', 0).set('second', 0).set('millisecond', 0),
    atNoonTimestamp: date.set('hour', 12).set('minute', 0).set('second', 0).set('millisecond', 0).unix(),
});
const todayDateFormated = formatedDates(todayDate);
const tomorrowDateFormated = formatedDates(tomorrowDate);

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
            raw_payload: {from: todayDateFormated.timestamp, to: tomorrowDateFormated.timestamp},
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
            raw_payload: {from: todayDateFormated.timestamp, to: tomorrowDateFormated.timestamp},
        },
    ],
};

const notReadonly = false;
const readonly = true;

describe('DSRangePickerWrapper', () => {
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

    test('Should display the value formatted for the current language', async () => {
        render(
            <Form>
                <Form.Item>
                    <DSRangePickerWrapper
                        value={[todayDate, tomorrowDate]}
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

        const rangePickerInputs = screen.getAllByRole('textbox');
        expect(rangePickerInputs[0]).toHaveValue(todayDateFormated.formated);
        expect(rangePickerInputs[1]).toHaveValue(tomorrowDateFormated.formated);
    });

    test('Should display the value formatted MM/DD/YYYY when the current language is english', async () => {
        render(
            <LangContext.Provider value={enLangContext}>
                <Form>
                    <Form.Item>
                        <DSRangePickerWrapper
                            value={[todayDate, tomorrowDate]}
                            attribute={mockFormAttribute}
                            readonly={notReadonly}
                            calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                            inheritedFlags={inheritedFlagsWithoutInheritedValue}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            </LangContext.Provider>,
        );

        const rangePickerInputs = screen.getAllByRole('textbox');
        expect(rangePickerInputs[0]).toHaveValue(todayDateFormated.formatedEn);
        expect(rangePickerInputs[1]).toHaveValue(tomorrowDateFormated.formatedEn);
    });

    test('Should display the value if focused', async () => {
        render(
            <Form>
                <Form.Item>
                    <DSRangePickerWrapper
                        value={[todayDate, tomorrowDate]}
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

        const textInput = screen.getAllByRole('textbox')[0];
        await user.click(textInput);
        const rangePickerInputs = screen.getAllByRole('textbox');
        expect(rangePickerInputs[0]).toHaveValue(todayDateFormated.formated);
        expect(rangePickerInputs[1]).toHaveValue(tomorrowDateFormated.formated);
    });

    test('Should display both dates formatted when idle, without needing focus', async () => {
        render(
            <Form>
                <Form.Item>
                    <DSRangePickerWrapper
                        value={[todayDate, tomorrowDate]}
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

        const rangePickerInputs = screen.getAllByRole('textbox');
        await waitFor(() => expect(rangePickerInputs[0]).toHaveValue(todayDateFormated.formated));
        expect(rangePickerInputs[1]).toHaveValue(tomorrowDateFormated.formated);
    });

    test('Should show the "enter a period" placeholder on the first field when idle with no value', async () => {
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
                    />
                </Form.Item>
            </Form>,
        );

        const rangePickerInputs = screen.getAllByRole('textbox');
        await waitFor(() =>
            expect(rangePickerInputs[0]).toHaveAttribute('placeholder', 'record_edition.placeholder.enter_a_period'),
        );
        expect(rangePickerInputs[1]).toHaveAttribute('placeholder', '');
    });

    test('Should be disabled when readonly', async () => {
        render(
            <Form>
                <Form.Item>
                    <DSRangePickerWrapper
                        value={[todayDate, tomorrowDate]}
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
                    />
                </Form.Item>
            </Form>,
        );

        const textInput = screen.getAllByRole('textbox')[0];
        await user.click(textInput);

        await user.click(screen.getAllByTitle(todayDateFormated.titleFormated)[0]);
        await user.click(screen.getAllByTitle(tomorrowDateFormated.titleFormated)[0]);

        expect(mockOnChange).toHaveBeenCalledWith(
            [todayDateFormated.atNoon, tomorrowDateFormated.atNoon],
            [todayDateFormated.formated, tomorrowDateFormated.formated],
        );

        expect(mockHandleSubmit).toHaveBeenCalledWith(
            JSON.stringify({
                from: todayDateFormated.atNoonTimestamp,
                to: tomorrowDateFormated.atNoonTimestamp,
            }),
            mockFormAttribute.id,
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
                    />
                </Form.Item>
            </Form>,
        );

        const textInput = screen.getAllByRole('textbox')[0];
        await user.click(textInput);

        const rangePickerInputs = screen.getAllByRole('textbox');
        await user.click(rangePickerInputs[0]);
        await user.click(screen.getAllByTitle(todayDateFormated.titleFormated)[0]);
        await user.click(screen.getAllByTitle(tomorrowDateFormated.titleFormated)[0]);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(mockHandleSubmit).toHaveBeenCalledTimes(1);

        const clearIcon = screen.getByLabelText('clear');
        await user.click(clearIcon);

        expect(mockOnChange).toHaveBeenCalledTimes(2);
        expect(mockHandleSubmit).toHaveBeenCalledTimes(2);
    });

    describe('Inherited values', () => {
        test('Should call onChange/handleSubmit with empty value on clear', async () => {
            render(
                <Form
                    initialValues={{
                        rangePickerTest: [todayDate, tomorrowDate],
                    }}
                >
                    <Form.Item name="rangePickerTest">
                        <DSRangePickerWrapper
                            value={[todayDate, tomorrowDate]}
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
                    <Form.Item name="rangePickerTest">
                        <DSRangePickerWrapper
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
                        rangePickerTest: todayDate,
                    }}
                >
                    <Form.Item name="rangePickerTest">
                        <DSRangePickerWrapper
                            value={[todayDate, tomorrowDate]}
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
                    <Form.Item name="rangePickerTest">
                        <DSRangePickerWrapper
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
