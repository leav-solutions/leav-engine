// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {DSDatePickerWrapper} from './DSDatePickerWrapper';
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
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
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

describe('DSDatePickerWrapper', () => {
    const mockOnChange = jest.fn();
    const mockHandleSubmit = jest.fn();
    const mockHandleBlur = jest.fn();
    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({});
        mockOnChange.mockReset();
        mockHandleSubmit.mockReset();
        mockHandleBlur.mockReset();
    });

    test('Should display presentationValue By default', async () => {
        const state = getInitialState({required: false, fallbackLang: false});
        const value = dayjs();
        const presentationValue = '12 octobre 2034';

        render(
            <Form>
                <Form.Item>
                    <DSDatePickerWrapper
                        state={state}
                        value={value}
                        presentationValue={presentationValue}
                        attribute={{} as RecordFormAttributeFragment}
                        onChange={mockOnChange}
                        handleSubmit={mockHandleSubmit}
                    />
                </Form.Item>
            </Form>
        );

        expect(screen.getByRole('textbox')).toHaveValue(presentationValue);
    });

    describe('Without required field', () => {
        test('Should call onChange / handle submit with value at noon', async () => {
            const state = getInitialState({required: false, fallbackLang: false});
            render(
                <Form>
                    <Form.Item>
                        <DSDatePickerWrapper
                            state={state}
                            presentationValue=""
                            attribute={{} as RecordFormAttributeFragment}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            await user.click(screen.getByRole('textbox'));
            const todayDate = dayjs();
            const formattedTodayDate = todayDate.format('YYYY-MM-DD');
            await user.click(screen.getByTitle(formattedTodayDate));

            const todayDateAtNoon = todayDate
                .utc()
                .set('date', todayDate.date())
                .set('hour', 12)
                .set('minute', 0)
                .set('second', 0)
                .set('millisecond', 0);

            expect(mockOnChange).toHaveBeenCalledWith(todayDateAtNoon, formattedTodayDate);
            expect(mockHandleSubmit).toHaveBeenCalledWith(todayDateAtNoon.unix().toString(), state.attribute.id);
        });

        test('Should save to LEAV if field becomes empty', async () => {
            const state = getInitialState({required: false, fallbackLang: false});
            render(
                <Form>
                    <Form.Item>
                        <DSDatePickerWrapper
                            state={state}
                            presentationValue=""
                            attribute={{} as RecordFormAttributeFragment}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            await user.click(screen.getByRole('textbox'));
            const todaysDate = dayjs().format('YYYY-MM-DD');
            await user.click(screen.getByTitle(todaysDate));

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
            const state = getInitialState({required: true, fallbackLang: false});
            render(
                <Form>
                    <Form.Item>
                        <DSDatePickerWrapper
                            state={state}
                            presentationValue=""
                            attribute={{} as RecordFormAttributeFragment}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            await user.click(screen.getByRole('textbox'));
            const todayDate = dayjs();
            const todayDateFormatted = dayjs().format('YYYY-MM-DD');
            await user.click(screen.getByTitle(todayDateFormatted));

            const todayDateAtNoon = todayDate
                .utc()
                .set('date', todayDate.date())
                .set('hour', 12)
                .set('minute', 0)
                .set('second', 0)
                .set('millisecond', 0);

            expect(mockOnChange).toHaveBeenCalled();
            expect(mockHandleSubmit).toHaveBeenCalledWith(todayDateAtNoon.unix().toString(), state.attribute.id);
        });

        test('Should not save to LEAV if field becomes empty', async () => {
            const state = getInitialState({required: true, fallbackLang: false});
            render(
                <Form>
                    <Form.Item>
                        <DSDatePickerWrapper
                            state={state}
                            presentationValue=""
                            attribute={{} as RecordFormAttributeFragment}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            await user.click(screen.getByRole('textbox'));
            const todaysDate = dayjs().format('YYYY-MM-DD');
            await user.click(screen.getByTitle(todaysDate));

            expect(mockOnChange).toHaveBeenCalledTimes(1);
            expect(mockHandleSubmit).toHaveBeenCalledTimes(1);

            const clearButton = screen.getByRole('button');
            await user.click(clearButton);

            expect(mockOnChange).toHaveBeenCalledTimes(2);
            expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
        });
    });

    describe('Inherited values', () => {
        test('Should call onChange/handleSubmit with empty value on clear', async () => {
            const raw_value = '1714138054';
            const state = getInitialState({required: false, fallbackLang: false});
            state.inheritedValue = {...mockValue.value, raw_value};
            state.isInheritedValue = true;
            state.isInheritedOverrideValue = true;
            state.isInheritedNotOverrideValue = false;
            render(
                <Form
                    initialValues={{
                        datePickerTest: dayjs.unix(Number(raw_value))
                    }}
                >
                    <Form.Item name="datePickerTest">
                        <DSDatePickerWrapper
                            state={state}
                            presentationValue=""
                            attribute={{} as RecordFormAttributeFragment}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            const clearButton = screen.getByRole('button');
            await user.click(clearButton);

            expect(mockOnChange).toHaveBeenCalledTimes(1);
            expect(mockOnChange).toHaveBeenCalledWith(expect.any(Object), raw_value);
            expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
            expect(mockHandleSubmit).toHaveBeenCalledWith('', state.attribute.id);
        });

        test('Should hide clear icon when value is inherited, but not override', async () => {
            const raw_value = '1714138054';
            const state = getInitialState({required: false, fallbackLang: false});
            state.inheritedValue = {...mockValue.value, raw_value};
            state.isInheritedValue = true;
            state.isInheritedOverrideValue = false;
            state.isInheritedNotOverrideValue = true;
            render(
                <Form
                    initialValues={{
                        datePickerTest: dayjs.unix(Number(raw_value))
                    }}
                >
                    <Form.Item name="datePickerTest">
                        <DSDatePickerWrapper
                            state={state}
                            presentationValue=""
                            attribute={{} as RecordFormAttributeFragment}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            expect(screen.queryByRole('button')).toBeNull();
        });
    });
    describe('Calculated values', () => {
        test('Should call onChange/handleSubmit with empty value on clear', async () => {
            const raw_value = '1714138054';
            const state = getInitialState({required: false, fallbackLang: false});
            state.calculatedValue = {...mockValue.value, raw_value};
            state.isCalculatedValue = true;
            state.isCalculatedOverrideValue = true;
            state.isCalculatedNotOverrideValue = false;
            render(
                <Form
                    initialValues={{
                        datePickerTest: dayjs.unix(Number(raw_value))
                    }}
                >
                    <Form.Item name="datePickerTest">
                        <DSDatePickerWrapper
                            state={state}
                            presentationValue=""
                            attribute={{} as RecordFormAttributeFragment}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            const clearButton = screen.getByRole('button');
            await user.click(clearButton);

            expect(mockOnChange).toHaveBeenCalledTimes(1);
            expect(mockOnChange).toHaveBeenCalledWith(expect.any(Object), raw_value);
            expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
            expect(mockHandleSubmit).toHaveBeenCalledWith('', state.attribute.id);
        });

        test('Should hide clear icon when value is calculated, but not override', async () => {
            const raw_value = '1714138054';
            const state = getInitialState({required: false, fallbackLang: false});
            state.calculatedValue = {...mockValue.value, raw_value};
            state.isCalculatedValue = true;
            state.isCalculatedOverrideValue = false;
            state.isCalculatedNotOverrideValue = true;
            render(
                <Form
                    initialValues={{
                        datePickerTest: dayjs.unix(Number(raw_value))
                    }}
                >
                    <Form.Item name="datePickerTest">
                        <DSDatePickerWrapper
                            state={state}
                            presentationValue=""
                            attribute={{} as RecordFormAttributeFragment}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            expect(screen.queryByRole('button')).toBeNull();
        });
    });
});
