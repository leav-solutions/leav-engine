import * as useGetRecordForm from '_ui/hooks/useGetRecordForm';
import * as gqlTypes from '_ui/_gqlTypes';
import {mockRecordForm} from '_ui/__mocks__/common/form';
import {mockRecord} from '_ui/__mocks__/common/record';
import {render, screen} from '../../../_tests/testUtils';
import EditRecordContent from './EditRecordContent';
import {Form} from 'antd';
import {type ComponentProps, type FunctionComponent} from 'react';

vi.mock('./uiElements/StandardField', () => ({default: () => <div>StandardField</div>}));

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
                    userData: {
                        global: false,
                        data: ['123465'],
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
});
