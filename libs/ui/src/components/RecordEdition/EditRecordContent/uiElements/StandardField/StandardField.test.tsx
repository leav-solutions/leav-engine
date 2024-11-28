// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {
    EditRecordReducerActionsTypes,
    initialState
} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import * as useEditRecordReducer from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import * as useRefreshFieldValues from '_ui/hooks/useRefreshFieldValues/useRefreshFieldValues';
import {
    AttributeFormat,
    AttributeType,
    RecordFormAttributeStandardAttributeFragment,
    ValueDetailsValueFragment
} from '_ui/_gqlTypes';
import {IRecordPropertyAttribute} from '_ui/_queries/records/getRecordPropertiesQuery';
import {render, screen, waitFor} from '_ui/_tests/testUtils';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {mockFormElementInput} from '_ui/__mocks__/common/form';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockModifier} from '_ui/__mocks__/common/value';
import {
    APICallStatus,
    DeleteMultipleValuesFunc,
    DeleteValueFunc,
    FormElement,
    ISubmitMultipleResult,
    SubmitValueFunc
} from '../../_types';
import StandardField from './StandardField';
import {AntForm} from 'aristid-ds';
import {getAntdFormInitialValues} from '../../antdUtils';
import {FormInstance} from 'antd';

jest.mock('../../hooks/useExecuteDeleteValueMutation');

jest.useRealTimers();
jest.setTimeout(15000);

const _makeRecordForm = (payloads: {payload: any; raw_payload: any}, format: AttributeFormat) => ({
    dependencyAttributes: [],
    elements: [
        {
            ...mockFormElementInput,
            settings: [
                {key: 'label', value: 'test attribute'},
                {key: 'attribute', value: 'test_attribute'}
            ],
            attribute: {...mockFormAttribute, format},
            values: [
                {
                    created_at: 123456789,
                    modified_at: 123456789,
                    created_by: mockModifier,
                    modified_by: mockModifier,
                    id_value: null,
                    metadata: null,
                    version: null,
                    ...payloads
                }
            ]
        }
    ],
    id: 'edition',
    recordId: 'recordId',
    library: {id: 'libraryId'}
});

describe('StandardField', () => {
    const mockEditRecordDispatch = jest.fn();
    jest.spyOn(useEditRecordReducer, 'useEditRecordReducer').mockImplementation(() => ({
        state: {...initialState, record: {...mockRecord}},
        dispatch: mockEditRecordDispatch
    }));

    jest.spyOn(useRefreshFieldValues, 'default').mockImplementation(() => ({
        fetchValues: jest.fn()
    }));

    const mockRecordValuesCommon = {
        created_at: 123456789,
        modified_at: 123456789,
        created_by: mockModifier,
        modified_by: mockModifier,
        id_value: null,
        metadata: null,
        version: null
    };

    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    const mockAttribute: IRecordPropertyAttribute = {
        id: 'test_attribute',
        label: {en: 'Test Attribute'},
        format: AttributeFormat.text,
        type: AttributeType.simple,
        system: false
    };

    const mockSubmitRes: ISubmitMultipleResult = {
        status: APICallStatus.SUCCESS,
        values: [
            {
                id_value: null,
                created_at: 1234567890,
                created_by: {
                    ...mockModifier
                },
                modified_at: 1234567890,
                modified_by: {
                    ...mockModifier
                },
                value: 'new value',
                raw_value: 'new raw value',
                version: null,
                attribute: mockAttribute as ValueDetailsValueFragment['attribute'],
                metadata: null
            }
        ]
    };
    const mockHandleSubmit: SubmitValueFunc = jest.fn().mockReturnValue(mockSubmitRes);
    const mockHandleDelete: DeleteValueFunc = jest.fn().mockReturnValue({status: APICallStatus.SUCCESS});
    const mockHandleMultipleValues: DeleteMultipleValuesFunc = jest
        .fn()
        .mockReturnValue({status: APICallStatus.SUCCESS});

    const baseProps = {
        onValueSubmit: mockHandleSubmit,
        onValueDelete: mockHandleDelete,
        onDeleteMultipleValues: mockHandleMultipleValues
    };

    global.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn()
    }));

    beforeEach(() => jest.clearAllMocks());

    test('Display informations about value', async () => {
        render(<StandardField element={mockFormElementInput} {...baseProps} />);

        const valueDisplayElem = screen.getByRole('textbox');
        await userEvent.click(valueDisplayElem);

        await waitFor(() => {
            expect(mockEditRecordDispatch).toHaveBeenCalled();
        });

        expect(mockEditRecordDispatch.mock.calls[0][0].type).toBe(EditRecordReducerActionsTypes.SET_ACTIVE_VALUE);
    });

    test('Cancel input', async () => {
        render(<StandardField element={mockFormElementInput} {...baseProps} />);

        let inputElem = screen.getByRole('textbox');
        await userEvent.click(inputElem);

        const cancelBtn = await screen.findByRole('button', {name: 'global.cancel'});
        expect(cancelBtn).toBeVisible();

        inputElem = screen.getByRole('textbox');
        await userEvent.clear(inputElem);
        await userEvent.type(inputElem, 'value modified');
        await waitFor(() => {
            expect(inputElem).toHaveValue('value modified');
        });

        await userEvent.click(cancelBtn);

        inputElem = screen.getByRole('textbox');

        await waitFor(() => {
            expect(inputElem).toHaveValue('My value formatted');
        });
        expect(inputElem).not.toHaveFocus();
    });

    test('Submit on enter', async () => {
        render(<StandardField element={mockFormElementInput} {...baseProps} />);

        const valueDisplayElem = screen.getByRole('textbox');

        await userEvent.click(valueDisplayElem);

        const inputElem = screen.getByRole('textbox');

        await userEvent.type(inputElem, 'value modified{enter}');

        await waitFor(() => {
            expect(mockHandleSubmit).toHaveBeenCalled();
        });
    });

    test('Disable readonly attribute', async () => {
        render(
            <StandardField
                element={{...mockFormElementInput, attribute: {...mockFormAttribute, readonly: true}}}
                {...baseProps}
            />
        );

        const inputElem = screen.getByRole('textbox');

        expect(inputElem).toBeDisabled();
    });

    test('Display error message', async () => {
        const onSubmitFail: SubmitValueFunc = jest.fn().mockReturnValue({
            status: APICallStatus.ERROR,
            error: 'ERROR_MESSAGE'
        });

        render(<StandardField element={mockFormElementInput} {...baseProps} onValueSubmit={onSubmitFail} />);

        await userEvent.click(screen.getByRole('textbox'));

        const submitBtn = await screen.findByRole('button', {name: 'global.submit'});
        await userEvent.click(submitBtn);

        expect(screen.getByText('ERROR_MESSAGE')).toBeInTheDocument();
    });
});
