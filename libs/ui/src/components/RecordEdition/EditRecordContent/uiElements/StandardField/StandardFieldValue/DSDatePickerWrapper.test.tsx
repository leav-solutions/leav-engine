// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {DSDatePickerWrapper} from './DSDatePickerWrapperWrapper';
import {FieldScope} from '../../../_types';
import {
    IStandardFieldReducerState,
    StandardFieldValueState
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockFormElementInput} from '_ui/__mocks__/common/form';
import {mockAttributeLink} from '_ui/__mocks__/common/attribute';
import userEvent from '@testing-library/user-event';
import {Form} from 'antd';
import dayjs from 'dayjs';
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
    attribute: mockAttributeLink,
    isReadOnly: false,
    activeScope: FieldScope.CURRENT,
    values: {
        [FieldScope.CURRENT]: {
            version: null,
            values: {[idValue]: mockValue}
        },
        [FieldScope.INHERITED]: null
    },
    metadataEdit: false,
    inheritedValue: null,
    isInheritedNotOverrideValue: false,
    isInheritedOverrideValue: false,
    isInheritedValue: false
});

describe('DSDatePickerWrapper', () => {
    const mockOnChange = jest.fn();
    const mockHandleSubmit = jest.fn();
    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({});
        mockOnChange.mockReset();
        mockHandleSubmit.mockReset();
    });

    describe('Without required field', () => {
        test('Should display date picker with fr label ', async () => {
            const state = getInitialState({required: false, fallbackLang: false});
            render(
                <Form>
                    <Form.Item>
                        <DSDatePickerWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={null}
                            handleSubmit={mockHandleSubmit}
                            onChange={mockOnChange}
                        />
                    </Form.Item>
                </Form>
            );

            expect(screen.getByText(fr_label)).toBeVisible();
        });

        test('Should display date picker with fallback label ', async () => {
            const state = getInitialState({required: false, fallbackLang: true});
            render(
                <Form>
                    <Form.Item>
                        <DSDatePickerWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={null}
                            handleSubmit={mockHandleSubmit}
                            onChange={mockOnChange}
                        />
                    </Form.Item>
                </Form>
            );

            expect(screen.getByText(en_label)).toBeVisible();
        });

        test('Should call onChange with value', async () => {
            const state = getInitialState({required: false, fallbackLang: false});
            render(
                <Form>
                    <Form.Item>
                        <DSDatePickerWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={null}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            await user.click(screen.getByRole('textbox'));
            const todaysDate = dayjs().format('YYYY-MM-DD');
            await user.click(screen.getByTitle(todaysDate));

            const unixTodaysDate = dayjs(todaysDate).unix().toString();

            expect(mockOnChange).toHaveBeenCalledWith(dayjs(todaysDate), todaysDate);
            expect(mockHandleSubmit).toHaveBeenCalledWith(unixTodaysDate, state.attribute.id);
        });

        test('Should save to LEAV if field becomes empty', async () => {
            const state = getInitialState({required: false, fallbackLang: false});
            render(
                <Form>
                    <Form.Item>
                        <DSDatePickerWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={null}
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
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={null}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            await user.click(screen.getByRole('textbox'));
            const todaysDate = dayjs().format('YYYY-MM-DD');
            await user.click(screen.getByTitle(todaysDate));

            const unixTodaysDate = dayjs(todaysDate).unix().toString();

            expect(mockOnChange).toHaveBeenCalled();
            expect(mockHandleSubmit).toHaveBeenCalledWith(unixTodaysDate, state.attribute.id);
        });

        test('Should not save to LEAV if field becomes empty', async () => {
            const state = getInitialState({required: true, fallbackLang: false});
            render(
                <Form>
                    <Form.Item>
                        <DSDatePickerWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={null}
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
        test('Should not display helper without inherited value', async () => {
            const state = getInitialState({required: false, fallbackLang: false});
            state.inheritedValue = null;
            state.isInheritedOverrideValue = false;
            render(
                <Form>
                    <Form.Item>
                        <DSDatePickerWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={null}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            expect(screen.queryByText('record_edition.inherited_input_helper', {exact: false})).not.toBeInTheDocument();
        });

        test('Should display helper with inherited value', async () => {
            const state = getInitialState({required: false, fallbackLang: false});
            state.inheritedValue = mockValue.value;
            state.isInheritedOverrideValue = true;
            render(
                <Form>
                    <Form.Item>
                        <DSDatePickerWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={null}
                            onChange={mockOnChange}
                            handleSubmit={mockHandleSubmit}
                        />
                    </Form.Item>
                </Form>
            );

            expect(screen.getByText('record_edition.inherited_input_helper', {exact: false})).toBeVisible();
        });

        test('Should call onChange/handleSubmit with inherited value on clear', async () => {
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
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={null}
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
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={null}
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
