// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as useGetRecordForm from '_ui/hooks/useGetRecordForm';
import * as gqlTypes from '_ui/_gqlTypes';
import {mockRecordForm} from '_ui/__mocks__/common/form';
import {mockRecord} from '_ui/__mocks__/common/record';
import {render, screen} from '../../../_tests/testUtils';
import EditRecord from './EditRecord';

jest.mock('./uiElements/StandardField', () => {
    return function StandardField() {
        return <div>StandardField</div>;
    };
});

describe('EditRecord', () => {
    const mocks = [
        {
            request: {
                query: gqlTypes.RecordUpdateDocument,
                variables: {
                    filters: {records: ['123456'], ignoreOwnEvents: true}
                }
            },
            result: {
                data: {
                    recordUpdate: {
                        record: {
                            whoAmI: {
                                ...mockRecord
                            },
                            modified_by: [{value: mockRecord}]
                        },
                        updatedValues: []
                    }
                }
            }
        },
        {
            request: {
                query: gqlTypes.GetUserDataDocument,
                variables: {
                    keys: ['records_consultation_record_lib']
                }
            },
            result: {
                data: {
                    userData: {
                        global: false,
                        data: []
                    }
                }
            }
        },
        {
            request: {
                query: gqlTypes.SaveUserDataDocument,
                variables: {
                    key: 'records_consultation_record_lib',
                    value: ['123456'],
                    global: false
                }
            },
            result: {
                data: {
                    userData: {
                        global: false,
                        data: ['123465']
                    }
                }
            }
        }
    ];

    afterAll(() => {
        jest.restoreAllMocks();
    });

    test('Display skeleton while loading', async () => {
        jest.spyOn(useGetRecordForm, 'default').mockImplementation(() => ({
            loading: true,
            error: null,
            recordForm: null,
            refetch: jest.fn()
        }));

        render(
            <EditRecord
                record={mockRecord}
                library={mockRecord.library.id}
                onValueDelete={jest.fn()}
                onValueSubmit={jest.fn()}
                onDeleteMultipleValues={jest.fn()}
                readonly={false}
            />,
            {
                mocks
            }
        );

        expect(screen.getAllByTestId('edit-record-skeleton').length).toBeGreaterThan(0);
    });

    test('Render form after loading', async () => {
        jest.spyOn(useGetRecordForm, 'default').mockImplementation(() => ({
            loading: false,
            error: null,
            recordForm: {
                dependencyAttributes: [],
                id: mockRecordForm.id,
                recordId: '123456',
                library: mockRecordForm.library,
                system: false,
                elements: mockRecordForm.elements
            },
            refetch: jest.fn()
        }));

        render(
            <EditRecord
                record={mockRecord}
                library={mockRecord.library.id}
                onValueDelete={jest.fn()}
                onValueSubmit={jest.fn()}
                onDeleteMultipleValues={jest.fn()}
                readonly={false}
            />,
            {
                mocks
            }
        );

        expect(await screen.findByTestId('container-child-element')).toBeInTheDocument();
        expect(screen.getByText('StandardField')).toBeInTheDocument();
    });
});
