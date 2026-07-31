import * as useGetRecordForm from '_ui/hooks/useGetRecordForm';
import * as useGetRecordValuesQueryModule from '_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery';
import * as gqlTypes from '_ui/_gqlTypes';
import {mockFormElementInput, mockRecordForm} from '_ui/__mocks__/common/form';
import {mockFormAttributeCompute} from '_ui/__mocks__/common/attribute';
import {mockRecord} from '_ui/__mocks__/common/record';
import {render, screen, waitFor} from '../../../_tests/testUtils';
import EditRecordContent from './EditRecordContent';
import {Form} from 'antd';
import {type ComponentProps, type FunctionComponent} from 'react';
import {APICallStatus} from './_types';

let capturedStandardFieldProps: ComponentProps<any>;

vi.mock('./uiElements/StandardField', () => ({
    default: (props: any) => {
        capturedStandardFieldProps = props;
        return <div>StandardField</div>;
    },
}));

const EditRecordContentWithForm: FunctionComponent<
    Omit<ComponentProps<typeof EditRecordContent>, 'antdForm'>
> = props => {
    const [form] = Form.useForm();

    return <EditRecordContent antdForm={form} {...props} />;
};

describe('EditRecordContent', () => {
    const mocks = [
        {
            request: {
                query: gqlTypes.RecordUpdateDocument,
                variables: {
                    filters: {records: ['123456'], ignoreOwnEvents: true},
                },
            },
            result: {
                data: {
                    recordUpdate: {
                        record: {
                            whoAmI: {
                                ...mockRecord,
                            },
                            modified_by: [{value: mockRecord}],
                        },
                        updatedValues: [],
                    },
                },
            },
        },
        {
            request: {
                query: gqlTypes.GetUserDataDocument,
                variables: {
                    keys: ['records_consultation_record_lib'],
                },
            },
            result: {
                data: {
                    userData: {
                        global: false,
                        data: [],
                    },
                },
            },
        },
        {
            request: {
                query: gqlTypes.SaveUserDataDocument,
                variables: {
                    key: 'records_consultation_record_lib',
                    value: ['123456'],
                    global: false,
                },
            },
            result: {
                data: {
                    saveUserData: {
                        global: false,
                        data: ['123456'],
                    },
                },
            },
        },
    ];

    afterAll(() => {
        vi.restoreAllMocks();
    });

    test('Display skeleton while loading', async () => {
        vi.spyOn(useGetRecordForm, 'default').mockImplementation(() => ({
            loading: true,
            error: null,
            recordForm: null,
            refetch: vi.fn(),
        }));

        render(
            <EditRecordContentWithForm
                record={mockRecord}
                isFormCreationMode={false}
                library={mockRecord.library.id}
                onRecordSubmit={vi.fn()}
                onValueDelete={vi.fn()}
                onValueSubmit={vi.fn()}
                onDeleteMultipleValues={vi.fn()}
                readonly={false}
            />,
            {
                mocks,
            },
        );

        expect(screen.getAllByTestId('edit-record-skeleton').length).toBeGreaterThan(0);
    });

    test('Render form after loading', async () => {
        vi.spyOn(useGetRecordForm, 'default').mockImplementation(() => ({
            loading: false,
            error: null,
            recordForm: {
                dependencyAttributes: [],
                id: mockRecordForm.id,
                recordId: '123456',
                library: mockRecordForm.library,
                system: false,
                elements: mockRecordForm.elements,
                sidePanel: mockRecordForm.sidePanel,
            },
            refetch: vi.fn(),
        }));

        render(
            <EditRecordContentWithForm
                record={mockRecord}
                isFormCreationMode={false}
                library={mockRecord.library.id}
                onRecordSubmit={vi.fn()}
                onValueDelete={vi.fn()}
                onValueSubmit={vi.fn()}
                onDeleteMultipleValues={vi.fn()}
                readonly={false}
            />,
            {
                mocks,
            },
        );

        expect(await screen.findByTestId('container-child-element')).toBeInTheDocument();
        expect(screen.getByText('StandardField')).toBeInTheDocument();
    });

    test('Render with custom formId', async () => {
        const spy = vi.spyOn(useGetRecordForm, 'default').mockImplementation(() => ({
            loading: true,
            error: null,
            recordForm: null,
            refetch: vi.fn(),
        }));

        render(
            <EditRecordContentWithForm
                record={mockRecord}
                formId="test"
                isFormCreationMode={false}
                library={mockRecord.library.id}
                onRecordSubmit={vi.fn()}
                onValueDelete={vi.fn()}
                onValueSubmit={vi.fn()}
                onDeleteMultipleValues={vi.fn()}
                readonly={false}
            />,
            {
                mocks,
            },
        );

        expect(spy).toHaveBeenCalledWith({
            libraryId: mockRecord.library.id,
            recordId: mockRecord.id,
            formId: 'test',
            version: null,
        });
    });

    // `settings` has to be the array shape `extractFormElements` expects, not `mockFormElementInput`'s
    // plain object — same fixup `mockRecordForm.elements` already applies.
    const inputElement = {...mockFormElementInput, settings: [{key: 'my_settings', value: 'value'}]};
    const computeElement = {...inputElement, id: 'compute_element', attribute: mockFormAttributeCompute};

    const _mockRecordFormWithElements = (elements: typeof mockRecordForm.elements) => ({
        dependencyAttributes: [],
        id: mockRecordForm.id,
        recordId: '123456',
        library: mockRecordForm.library,
        system: false,
        elements,
        sidePanel: mockRecordForm.sidePanel,
    });

    test('Skips the compute values refetch after a submit when the form has no compute attribute (LEAVC-996)', async () => {
        vi.spyOn(useGetRecordForm, 'default').mockImplementation(() => ({
            loading: false,
            error: null,
            recordForm: _mockRecordFormWithElements([inputElement]),
            refetch: vi.fn(),
        }));

        const refetchComputeFields = vi.fn();
        vi.spyOn(useGetRecordValuesQueryModule, 'useGetRecordValuesQuery').mockReturnValue({
            data: undefined,
            error: undefined,
            refetch: refetchComputeFields,
        } as any);

        render(
            <EditRecordContentWithForm
                record={mockRecord}
                isFormCreationMode={false}
                library={mockRecord.library.id}
                onRecordSubmit={vi.fn()}
                onValueDelete={vi.fn()}
                onValueSubmit={vi.fn().mockResolvedValue({status: APICallStatus.SUCCESS})}
                onDeleteMultipleValues={vi.fn()}
                readonly={false}
            />,
            {mocks},
        );

        await screen.findAllByText('StandardField');

        await capturedStandardFieldProps.onValueSubmit(
            [{attribute: inputElement.attribute, value: 'new value', idValue: 'value1'}],
            null,
        );

        expect(refetchComputeFields).not.toHaveBeenCalled();
    });

    test('Refetches the compute values after a submit when the form has a compute attribute', async () => {
        vi.spyOn(useGetRecordForm, 'default').mockImplementation(() => ({
            loading: false,
            error: null,
            recordForm: _mockRecordFormWithElements([inputElement, computeElement]),
            refetch: vi.fn(),
        }));

        const refetchComputeFields = vi.fn().mockResolvedValue({data: {}});
        vi.spyOn(useGetRecordValuesQueryModule, 'useGetRecordValuesQuery').mockReturnValue({
            data: undefined,
            error: undefined,
            refetch: refetchComputeFields,
        } as any);

        render(
            <EditRecordContentWithForm
                record={mockRecord}
                isFormCreationMode={false}
                library={mockRecord.library.id}
                onRecordSubmit={vi.fn()}
                onValueDelete={vi.fn()}
                onValueSubmit={vi.fn().mockResolvedValue({status: APICallStatus.SUCCESS})}
                onDeleteMultipleValues={vi.fn()}
                readonly={false}
            />,
            {mocks},
        );

        await screen.findAllByText('StandardField');

        await capturedStandardFieldProps.onValueSubmit(
            [{attribute: inputElement.attribute, value: 'new value', idValue: 'value1'}],
            null,
        );

        await waitFor(() => expect(refetchComputeFields).toHaveBeenCalledWith([mockRecord.id]));
    });
});
