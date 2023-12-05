// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {purgeRecordsMutation} from 'queries/records/purgeRecords';
import {getRecordsListQuery} from 'queries/records/recordsListQuery';
import {render, screen, waitFor} from '_tests/testUtils';
import {mockLibrary} from '__mocks__/libraries';
import PurgeTab from './PurgeTab';

describe('PurgeTab', () => {
    const mockGetRecordsList = {
        request: {
            query: getRecordsListQuery,
            variables: {
                library: mockLibrary.id,
                pagination: {limit: 1, offset: 0},
                filters: [{field: 'active', condition: 'EQUAL', value: 'false'}]
            }
        },
        result: {
            data: {
                records: {
                    __typename: 'RecordList',
                    totalCount: 1337,
                    list: [
                        {
                            __typename: 'Record',
                            whoAmI: {
                                __typename: 'RecordIdentity',
                                id: '1',
                                label: 'My record',
                                color: '#123456',
                                preview: {
                                    __typename: 'Preview',
                                    small: 'path/to/preview.png',
                                    medium: 'path/to/preview.png',
                                    pdf: 'path/to/file.pdf',
                                    big: 'path/to/preview.png'
                                },
                                library: {
                                    __typename: 'Library',
                                    id: 'library-id',
                                    label: {
                                        fr: 'Librairie',
                                        en: 'Library'
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        }
    };

    test('Render test', async () => {
        const mocks = [
            mockGetRecordsList,
            {
                request: {
                    query: purgeRecordsMutation,
                    variables: {
                        libraryId: mockLibrary.id
                    }
                },
                result: () => {
                    purgeCalled = true;
                    return {
                        data: {
                            purgeInactiveRecords: [
                                {
                                    __typename: 'Product',
                                    id: '1'
                                }
                            ]
                        }
                    };
                }
            }
        ];
        let purgeCalled = false;

        render(<PurgeTab readonly={false} library={mockLibrary} />, {
            apolloMocks: mocks,
            cacheSettings: {possibleTypes: {Record: ['Product']}}
        });

        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        expect(await screen.findByText(/1337/)).toBeInTheDocument();

        userEvent.click(screen.getByRole('button', {name: /purge/i}));

        expect(await screen.findByText(/confirm/i)).toBeInTheDocument();
        userEvent.click(screen.getByRole('button', {name: /submit/i})); // Confirm

        await waitFor(() => expect(purgeCalled).toBe(true));
    });

    test('If readonly, cannot start purge', async () => {
        const mocks = [mockGetRecordsList];

        render(<PurgeTab readonly library={mockLibrary} />, {
            apolloMocks: mocks,
            cacheSettings: {possibleTypes: {Record: ['Product']}}
        });

        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        expect(await screen.findByText(/1337/)).toBeInTheDocument();

        expect(screen.queryByRole('button', {name: /purge/i})).not.toBeInTheDocument();
    });
});
