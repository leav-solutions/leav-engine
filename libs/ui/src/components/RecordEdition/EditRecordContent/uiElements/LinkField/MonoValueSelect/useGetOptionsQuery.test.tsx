// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    IGetRecordsFromLibraryQuery,
    getRecordsFromLibraryQuery,
    IGetRecordsFromLibraryQueryVariables
} from '_ui/_queries/records/getRecordsFromLibraryQuery';
import {SortOrder} from '_ui/_gqlTypes';
import {MockedResponse} from '@apollo/client/testing';
import {useGetOptionsQuery} from './useGetOptionsQuery';
import {act, renderHook, waitFor} from '_ui/_tests/testUtils';

describe('useGetOptionsQuery', () => {
    const onSelectChangeMock = jest.fn();

    const firstRecord = {
        id: '28121951',
        _id: '28121951',
        whoAmI: {
            id: '28121951',
            label: 'Danette pistache',
            subLabel: null,
            preview: null,
            library: {
                id: 'id_library',
                label: null
            },
            color: null
        },
        __typename: 'Record'
    };

    const secondRecord = {
        id: '15061943',
        _id: '15061943',
        whoAmI: {
            id: '15061943',
            label: 'Danette chocolat',
            subLabel: null,
            preview: null,
            library: {
                id: 'id_library',
                label: null
            },
            color: null
        },
        __typename: 'Record'
    };

    const records = {
        __typename: 'RecordList',
        list: [firstRecord, secondRecord],
        totalCount: 2
    };

    const recordsWithoutLabel = {
        __typename: 'RecordList',
        list: [
            {
                ...firstRecord,
                whoAmI: {
                    ...firstRecord.whoAmI,
                    label: null
                }
            },
            {
                ...secondRecord,
                whoAmI: {
                    ...secondRecord.whoAmI,
                    label: null
                }
            }
        ],
        totalCount: 2
    };

    const linkedLibraryId = 'linkedLibraryId';
    const mockFactory: (
        data: IGetRecordsFromLibraryQuery,
        variables?: Partial<IGetRecordsFromLibraryQueryVariables>
    ) => MockedResponse[] = (data, variables) => [
        {
            request: {
                query: getRecordsFromLibraryQuery([], true),
                variables: {
                    library: linkedLibraryId,
                    limit: 20,
                    sort: {field: 'created_at', order: SortOrder.desc},
                    ...variables
                }
            },
            result: {data}
        }
    ];

    beforeEach(() => {
        onSelectChangeMock.mockClear();
    });

    test('Should set loading to false once data is loaded', async () => {
        const mock = mockFactory({records: {list: [], totalCount: 0}});

        const {result} = renderHook((...props) => useGetOptionsQuery(...props), {
            initialProps: {
                activeValue: undefined,
                linkedLibraryId,
                onSelectChange: onSelectChangeMock
            },
            mocks: mock
        });

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));
    });

    test('should return infos about options type and counts', async () => {
        const fakeTotalCount = 42;
        const mock = mockFactory({records: {...records, totalCount: fakeTotalCount}});
        const refetchMock = mockFactory(
            {records: {list: [records.list[0]], totalCount: 1}},
            {sort: undefined, fullText: 'search'}
        );

        const {result} = renderHook((...props) => useGetOptionsQuery(...props), {
            initialProps: {
                activeValue: undefined,
                linkedLibraryId,
                onSelectChange: onSelectChangeMock
            },
            mocks: [...mock, ...refetchMock]
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.optionsType).toBe('suggestions');
        expect(result.current.suggestionsCount).toBe(20);
        expect(result.current.searchResultCount).toBe(fakeTotalCount);
        expect(result.current.totalCount).toBe(fakeTotalCount);

        await act(async () => {
            result.current.runFullTextSearch('search');
        });

        await waitFor(() => {
            expect(result.current.optionsType).toBe('search');
        });

        expect(result.current.suggestionsCount).toBe(20);
        expect(result.current.searchResultCount).toBe(1);
        expect(result.current.totalCount).toBe(fakeTotalCount);
    });

    test('should handle case where total count is lower than suggestion limit', async () => {
        const mock = mockFactory({records: {...records}});
        const refetchMock = mockFactory(
            {records: {list: [records.list[0]], totalCount: 1}},
            {sort: undefined, fullText: 'search'}
        );

        const {result} = renderHook((...props) => useGetOptionsQuery(...props), {
            initialProps: {
                activeValue: undefined,
                linkedLibraryId,
                onSelectChange: onSelectChangeMock
            },
            mocks: [...mock, ...refetchMock]
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.optionsType).toBe('suggestions');
        expect(result.current.suggestionsCount).toBe(records.totalCount);
    });

    test('Should return fake options with skeleton during loading', async () => {
        const mock = mockFactory({records: {list: [], totalCount: 0}});
        const refetchMock = mockFactory({records: {list: [], totalCount: 0}}, {sort: undefined, fullText: 'search'});

        const {result} = renderHook((...props) => useGetOptionsQuery(...props), {
            initialProps: {
                activeValue: undefined,
                linkedLibraryId,
                onSelectChange: onSelectChangeMock
            },
            mocks: [...mock, ...refetchMock]
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            result.current.runFullTextSearch('search');
        });

        expect(result.current.selectOptions).toHaveLength(10);
        expect(result.current.selectOptions[0]).toEqual({
            value: expect.stringContaining('skeleton'),
            idCard: {
                title: expect.anything(),
                avatarProps: {
                    src: expect.anything()
                }
            }
        });
    });

    test('Should expose selectOptions ready to display', async () => {
        const mock = mockFactory({records});

        const {result} = renderHook(
            () =>
                useGetOptionsQuery({
                    activeValue: undefined,
                    linkedLibraryId,
                    onSelectChange: onSelectChangeMock
                }),
            {mocks: mock}
        );

        expect(result.current.selectOptions).toEqual([]);

        await waitFor(() =>
            expect(result.current.selectOptions).toEqual([
                {
                    idCard: {
                        avatarProps: expect.anything(),
                        title: 'Danette chocolat'
                    },
                    label: 'Danette chocolat',
                    value: '15061943'
                },
                {
                    idCard: {
                        avatarProps: expect.anything(),
                        title: 'Danette pistache'
                    },
                    label: 'Danette pistache',
                    value: '28121951'
                }
            ])
        );
    });

    test('Should expose selectOptions with ids as labels ready to display', async () => {
        const mock = mockFactory({records: recordsWithoutLabel});

        const {result} = renderHook(
            () =>
                useGetOptionsQuery({
                    activeValue: undefined,
                    linkedLibraryId,
                    onSelectChange: onSelectChangeMock
                }),
            {mocks: mock}
        );

        expect(result.current.selectOptions).toEqual([]);

        await waitFor(() =>
            expect(result.current.selectOptions).toEqual([
                {
                    idCard: {
                        avatarProps: expect.anything(),
                        title: '28121951'
                    },
                    label: '28121951',
                    value: '28121951'
                },
                {
                    idCard: {
                        avatarProps: expect.anything(),
                        title: '15061943'
                    },
                    label: '15061943',
                    value: '15061943'
                }
            ])
        );
    });

    test('Should augment selectOptions with activeValue', async () => {
        const mock = mockFactory({records});
        const activeValue = {
            linkValue: {
                id: '1000',
                whoAmI: {
                    id: '2000',
                    label: 'une danette à la prune',
                    library: {
                        id: 'id_library',
                        label: null
                    }
                }
            }
        };

        const {result} = renderHook(
            () =>
                useGetOptionsQuery({
                    activeValue,
                    linkedLibraryId,
                    onSelectChange: onSelectChangeMock
                }),
            {mocks: mock}
        );

        expect(result.current.selectOptions).toEqual([
            {
                idCard: {
                    avatarProps: expect.anything(),
                    title: 'une danette à la prune'
                },
                label: 'une danette à la prune',
                value: '2000'
            }
        ]);

        await waitFor(() =>
            expect(result.current.selectOptions).toEqual([
                {
                    idCard: {
                        avatarProps: expect.anything(),
                        title: 'Danette chocolat'
                    },
                    label: 'Danette chocolat',
                    value: '15061943'
                },
                {
                    idCard: {
                        avatarProps: expect.anything(),
                        title: 'Danette pistache'
                    },
                    label: 'Danette pistache',
                    value: '28121951'
                },
                {
                    idCard: {
                        avatarProps: expect.anything(),
                        title: 'une danette à la prune'
                    },
                    label: 'une danette à la prune',
                    value: '2000'
                }
            ])
        );
    });

    describe('updateLeavField', () => {
        test('Should call onSelectChange with linkValue if record not in list', async () => {
            const mock = mockFactory({records});
            const activeValue = {
                linkValue: {
                    id: '1000',
                    whoAmI: {
                        id: '2000',
                        label: 'une danette à la prune',
                        library: {
                            id: 'id_library',
                            label: null
                        }
                    }
                }
            };

            const {result} = renderHook(
                () =>
                    useGetOptionsQuery({
                        activeValue,
                        linkedLibraryId,
                        onSelectChange: onSelectChangeMock
                    }),
                {mocks: mock}
            );

            await waitFor(() => result.current.selectOptions.length === 3);
            result.current.updateLeavField('notFound');

            expect(onSelectChangeMock).toHaveBeenCalledWith([activeValue.linkValue]);
        });

        test('Should call onSelectChange with selectedLinkValue if record in list', async () => {
            const mock = mockFactory({records});
            const activeValue = {
                linkValue: {
                    id: '1000',
                    whoAmI: {
                        id: '2000',
                        label: 'une danette à la prune',
                        library: {
                            id: 'id_library',
                            label: null
                        }
                    }
                }
            };

            const {result} = renderHook(
                () =>
                    useGetOptionsQuery({
                        activeValue,
                        linkedLibraryId,
                        onSelectChange: onSelectChangeMock
                    }),
                {mocks: mock}
            );

            await waitFor(() => result.current.selectOptions.length === 3);

            const selectedRecord = records.list[0];
            result.current.updateLeavField(selectedRecord.id);

            expect(onSelectChangeMock).toHaveBeenCalledWith([records.list[0]]);
        });
    });
});
