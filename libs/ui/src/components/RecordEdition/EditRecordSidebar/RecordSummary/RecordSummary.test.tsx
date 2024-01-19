// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getRecordColumnsValues} from '_ui/_queries/records/getRecordColumnsValues';
import {render, screen} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import RecordSummary from './RecordSummary';

describe('RecordSummary', () => {
    test('Display summary', async () => {
        const mocks = [
            {
                request: {
                    query: getRecordColumnsValues(['created_at', 'created_by', 'modified_at', 'modified_by']),
                    variables: {
                        library: 'record_lib',
                        filters: [{field: 'id', condition: 'EQUAL', value: '123456'}]
                    }
                },
                result: {
                    data: {
                        records: {
                            list: [
                                {
                                    _id: 123456,
                                    created_at: '2020-01-01',
                                    created_by: {
                                        id: '1',
                                        label: 'admin'
                                    },
                                    modified_at: '2020-01-01',
                                    modified_by: {
                                        id: '1',
                                        label: 'admin'
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ];

        render(<RecordSummary record={mockRecord} />, {mocks});

        expect(await screen.findByAltText('record preview')).toBeInTheDocument();
        expect(screen.getByText(mockRecord.id)).toBeInTheDocument();
        expect(screen.getByText(mockRecord.label)).toBeInTheDocument();
    });
});
