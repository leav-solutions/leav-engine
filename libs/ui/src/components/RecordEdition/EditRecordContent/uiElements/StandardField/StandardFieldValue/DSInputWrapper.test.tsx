// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {DSInputWrapper} from './DSInputWrapper';
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
import {RecordFormElementsValueStandardValue} from '_ui/hooks/useGetRecordForm';

const label = 'label';
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

const getInitialState = (required: boolean): IStandardFieldReducerState => ({
    record: mockRecord,
    formElement: {
        ...mockFormElementInput,
        settings: {
            label,
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
    metadataEdit: false
});

describe('DSInputWrapper', () => {
    const mockHandleSubmit = jest.fn();
    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({});
        mockHandleSubmit.mockReset();
    });

    test('Should submit empty value if field is not required', async () => {
        const state = getInitialState(false);
        render(
            <Form>
                <Form.Item>
                    <DSInputWrapper state={state} infoButton="" handleSubmit={mockHandleSubmit} />
                </Form.Item>
            </Form>
        );

        const input = screen.getByRole('textbox');
        await user.click(input);
        await user.tab();

        expect(mockHandleSubmit).toHaveBeenCalledWith('', state.attribute.id);
    });

    describe('With required input', () => {
        test('Should submit the value if field is not empty', async () => {
            const state = getInitialState(true);
            render(
                <Form>
                    <Form.Item>
                        <DSInputWrapper state={state} infoButton="" handleSubmit={mockHandleSubmit} />
                    </Form.Item>
                </Form>
            );

            const text = 'text';
            const input = screen.getByRole('textbox');
            await user.click(input);
            await user.type(input, text);
            await user.tab();

            expect(mockHandleSubmit).toHaveBeenCalledWith(text, state.attribute.id);
        });

        test('Should submit the default value if field is empty', async () => {
            const state = getInitialState(true);
            render(
                <Form>
                    <Form.Item>
                        <DSInputWrapper state={state} infoButton="" handleSubmit={mockHandleSubmit} />
                    </Form.Item>
                </Form>
            );

            const input = screen.getByRole('textbox');
            await user.click(input);
            await user.tab();

            expect(mockHandleSubmit).toHaveBeenCalledWith(
                (state.formElement.values[0] as RecordFormElementsValueStandardValue).raw_value,
                state.attribute.id
            );
        });
    });
});
