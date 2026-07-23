import userEvent from '@testing-library/user-event';
import {render, screen, waitFor} from '../../../../../_tests/testUtils';
import {mockLibrary} from '../../../../../__mocks__/libraries';
import PurgeTab from './PurgeTab';
import {PurgeRecordsDocument, RecordsListDocument} from '../../../../../_gqlTypes';

describe('PurgeTab', () => {
    const mockGetRecordsList = {
        request: {
            query: RecordsListDocument,
            variables: {
                library: mockLibrary.id,
                pagination: {limit: 1, offset: 0},
                filters: [{field: 'active', condition: 'EQUAL', value: 'false'}],
            },
        },
        // The inactive-records count is re-fetched after a purge, so the query fires more than once.
        maxUsageCount: Number.POSITIVE_INFINITY,
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
                                    big: 'path/to/preview.png',
                                },
                                library: {
                                    __typename: 'Library',
                                    id: 'library-id',
                                    label: {
                                        fr: 'Librairie',
                                        en: 'Library',
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        },
    };

    test('Render test', async () => {
        const mocks = [
            mockGetRecordsList,
            {
                request: {
                    query: PurgeRecordsDocument,
                    variables: {
                        libraryId: mockLibrary.id,
                    },
                },
                result: () => {
                    purgeCalled = true;
                    return {
                        data: {
                            purgeInactiveRecords: [
                                {
                                    __typename: 'Product',
                                    id: '1',
                                },
                            ],
                        },
                    };
                },
            },
        ];
        let purgeCalled = false;

        render(<PurgeTab readonly={false} library={mockLibrary} />, {
            apolloMocks: mocks,
            cacheSettings: {possibleTypes: {Record: ['Product']}},
        });

        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        expect(await screen.findByText(/1337/)).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', {name: /purge/i}));

        expect(await screen.findByText(/confirm/i)).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', {name: /submit/i})); // Confirm

        await waitFor(() => expect(purgeCalled).toBe(true));
    });

    test('If readonly, cannot start purge', async () => {
        const mocks = [mockGetRecordsList];

        render(<PurgeTab readonly library={mockLibrary} />, {
            apolloMocks: mocks,
            cacheSettings: {possibleTypes: {Record: ['Product']}},
        });

        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        expect(await screen.findByText(/1337/)).toBeInTheDocument();

        expect(screen.queryByRole('button', {name: /purge/i})).not.toBeInTheDocument();
    });
});
