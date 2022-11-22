// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getRecordColumnsValues} from 'graphQL/queries/records/getRecordColumnsValues';
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {mockRecord} from '__mocks__/common/record';
import RecordSummary from './RecordSummary';

describe('RecordSummary', () => {
    test('Display summary', async () => {
        const mocks = [
            {
                request: {
                    query: getRecordColumnsValues('record_libs', [
                        'created_at',
                        'created_by',
                        'modified_at',
                        'modified_by'
                    ]),
                    variables: {
                        filters: [{field: 'id', condition: 'EQUAL', value: '123456'}]
                    }
                },
                result: {
                    data: {
                        record_libs: {
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

        await act(async () => {
            render(<RecordSummary record={mockRecord} />, {apolloMocks: mocks});
        });

        expect(screen.getByAltText('record preview')).toBeInTheDocument();
        expect(screen.getByText(mockRecord.id)).toBeInTheDocument();
        expect(screen.getByText(mockRecord.label)).toBeInTheDocument();
    });
});
