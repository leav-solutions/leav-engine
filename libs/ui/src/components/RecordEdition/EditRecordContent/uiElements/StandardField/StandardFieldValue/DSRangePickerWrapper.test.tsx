// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {DSRangePickerWrapper} from './DSRangePickerWrapper';
import {VersionFieldScope} from '../../../_types';
import {
    IStandardFieldReducerState,
    StandardFieldValueState
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockFormElementInput} from '_ui/__mocks__/common/form';
import userEvent from '@testing-library/user-event';
import {Form} from 'antd';
import dayjs from 'dayjs';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';

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

describe('DSRangePickerWrapper', () => {
    const mockOnChange = jest.fn();
    const mockHandleSubmit = jest.fn();
    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({});
        mockOnChange.mockReset();
        mockHandleSubmit.mockReset();
    });

    test('Should display presentationValue by default', async () => {
        const state = getInitialState(false);
        const presentationValue = 'Du 20 novembre au 12 décembre';
        render(
            <Form>
                <Form.Item>
                    <DSRangePickerWrapper
                        data-testid="test"
                        state={state}
                        presentationValue={presentationValue}
                        onChange={mockOnChange}
                        handleSubmit={mockHandleSubmit}
                    />
                </Form.Item>
            </Form>
        );

        expect(screen.getByRole('textbox')).toHaveValue(presentationValue);
    });

    describe('Without required field', () => {
        test('Should call onChange with value', async () => {
            const state = getInitialState(false);
            render(
                <Form>
                    <Form.Item>
                        <DSRangePickerWrapper
                            data-testid="test"
                            state={state}
                            presentationValue=""
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            const rangePickerInputs = screen.getAllByRole('textbox');
            await user.click(rangePickerInputs[0]);

            const startRangeDate = dayjs();
            const startRangeDateFormatted = dayjs().format('YYYY-MM-DD');
            const endRangeDate = dayjs().add(1, 'day');
            const endRangeDateFormatted = dayjs().add(1, 'day').format('YYYY-MM-DD');

            await user.click(screen.getAllByTitle(startRangeDateFormatted)[0]);
            await user.click(screen.getAllByTitle(endRangeDateFormatted)[0]);

            const startRangeDateAtNoon = startRangeDate
                .utc()
                .set('date', startRangeDate.date())
                .set('hour', 12)
                .set('minute', 0)
                .set('second', 0)
                .set('millisecond', 0);

            const endRangeDateAtNoon = endRangeDate
                .utc()
                .set('date', endRangeDate.date())
                .set('hour', 12)
                .set('minute', 0)
                .set('second', 0)
                .set('millisecond', 0);

            expect(mockOnChange).toHaveBeenCalledWith(
                [startRangeDateAtNoon, endRangeDateAtNoon],
                [startRangeDateFormatted, endRangeDateFormatted]
            );

            expect(mockHandleSubmit).toHaveBeenCalledWith(
                {from: startRangeDateAtNoon.unix().toString(), to: endRangeDateAtNoon.unix().toString()},
                state.attribute.id
            );
        });

        test('Should save to LEAV if field becomes empty', async () => {
            const state = getInitialState(false);
            render(
                <Form>
                    <Form.Item>
                        <DSRangePickerWrapper
                            data-testid="test"
                            state={state}
                            presentationValue="some date"
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            const rangePickerInputs = screen.getAllByRole('textbox');
            await user.click(rangePickerInputs[0]);
            const currentDate = dayjs().format('YYYY-MM-DD');
            await user.click(screen.getAllByTitle(currentDate)[0]);
            await user.click(screen.getAllByTitle(currentDate)[0]);

            expect(mockOnChange).toHaveBeenCalledTimes(1);
            expect(mockHandleSubmit).toHaveBeenCalledTimes(1);

            const clearButton = screen.getByRole('button');
            await user.click(clearButton);

            expect(mockOnChange).toHaveBeenCalledTimes(2);
            expect(mockHandleSubmit).toHaveBeenCalledTimes(2);
        });
    });

    describe('With required field', () => {
        test('Should save to LEAV if field is not empty', async () => {
            const state = getInitialState(true);
            render(
                <Form>
                    <Form.Item>
                        <DSRangePickerWrapper
                            data-testid="test"
                            state={state}
                            presentationValue=""
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            const rangePickerInputs = screen.getAllByRole('textbox');
            await user.click(rangePickerInputs[0]);
            const startRangeDate = dayjs();
            const startRangeDateFormatted = dayjs().format('YYYY-MM-DD');
            const endRangeDate = dayjs().add(1, 'day');
            const endRangeDateFormatted = dayjs().add(1, 'day').format('YYYY-MM-DD');

            await user.click(screen.getAllByTitle(startRangeDateFormatted)[0]);
            await user.click(screen.getAllByTitle(endRangeDateFormatted)[0]);

            const startRangeDateAtNoon = startRangeDate
                .utc()
                .set('date', startRangeDate.date())
                .set('hour', 12)
                .set('minute', 0)
                .set('second', 0)
                .set('millisecond', 0);

            const endRangeDateAtNoon = endRangeDate
                .utc()
                .set('date', endRangeDate.date())
                .set('hour', 12)
                .set('minute', 0)
                .set('second', 0)
                .set('millisecond', 0);

            expect(mockOnChange).toHaveBeenCalled();
            expect(mockHandleSubmit).toHaveBeenCalledWith(
                {from: startRangeDateAtNoon.unix().toString(), to: endRangeDateAtNoon.unix().toString()},
                state.attribute.id
            );
        });

        test('Should display presentationValue after save', async () => {
            const state = getInitialState(true);
            const presentationValue = 'presentationValue';
            render(
                <Form>
                    <Form.Item>
                        <DSRangePickerWrapper
                            data-testid="test"
                            state={state}
                            presentationValue={presentationValue}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            const rangePickerInputs = screen.getAllByRole('textbox');
            await user.click(rangePickerInputs[0]);
            expect(screen.queryByText(presentationValue)).not.toBeInTheDocument();
            const startRangeDateFormatted = dayjs().format('YYYY-MM-DD');
            const endRangeDateFormatted = dayjs().add(1, 'day').format('YYYY-MM-DD');

            await user.click(screen.getAllByTitle(startRangeDateFormatted)[0]);
            await user.click(screen.getAllByTitle(endRangeDateFormatted)[0]);

            expect(screen.getByRole('textbox')).toHaveValue(presentationValue);
        });

        test.skip('Should not save to LEAV if field becomes empty', async () => {
            const state = getInitialState(true);
            render(
                <Form>
                    <Form.Item>
                        <DSRangePickerWrapper
                            data-testid="test"
                            state={state}
                            presentationValue="some date"
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            const rangePickerInputs = screen.getAllByRole('textbox');
            await user.click(rangePickerInputs[0]);
            const currentDate = dayjs().format('YYYY-MM-DD');
            await user.click(screen.getAllByTitle(currentDate)[0]);
            await user.click(screen.getAllByTitle(currentDate)[0]);

            expect(mockOnChange).toHaveBeenCalledTimes(1);
            expect(mockHandleSubmit).toHaveBeenCalledTimes(1);

            const clearButton = screen.getByRole('button');
            await user.click(clearButton);

            expect(mockOnChange).toHaveBeenCalledTimes(2);
            expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
        });
    });

    describe('Inherited values', () => {
        test('Should hide clear icon when value is inherited, but not override', async () => {
            const raw_value = {
                from: '1714138054',
                to: '1714138054'
            };
            const state = getInitialState(false);
            state.inheritedValue = {...mockValue.value, raw_value};
            state.isInheritedValue = true;
            state.isInheritedOverrideValue = false;
            state.isInheritedNotOverrideValue = true;
            render(
                <Form
                    initialValues={{
                        dateRangeTest: [dayjs.unix(Number(raw_value.from)), dayjs.unix(Number(raw_value.to))]
                    }}
                >
                    <Form.Item name="dateRangeTest">
                        <DSRangePickerWrapper
                            data-testid="test"
                            state={state}
                            presentationValue=""
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            const clearButton = screen.queryByRole('button');
            expect(clearButton).toBeNull();
        });
    });

    describe('Calculated values', () => {
        test('Should hide clear icon when value is calculated, but not override', async () => {
            const raw_value = {
                from: '1714138054',
                to: '1714138054'
            };
            const state = getInitialState(false);
            state.calculatedValue = {...mockValue.value, raw_value};
            state.isCalculatedValue = true;
            state.isCalculatedOverrideValue = false;
            state.isCalculatedNotOverrideValue = true;
            render(
                <Form
                    initialValues={{
                        dateRangeTest: [dayjs.unix(Number(raw_value.from)), dayjs.unix(Number(raw_value.to))]
                    }}
                >
                    <Form.Item name="dateRangeTest">
                        <DSRangePickerWrapper
                            data-testid="test"
                            state={state}
                            presentationValue=""
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            const clearButton = screen.queryByRole('button');
            expect(clearButton).toBeNull();
        });
    });
});
