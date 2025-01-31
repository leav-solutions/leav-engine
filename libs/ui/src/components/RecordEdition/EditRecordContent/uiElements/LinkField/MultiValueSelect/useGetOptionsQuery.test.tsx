// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IGetRecordsFromLibraryQuery, getRecordsFromLibraryQuery} from '_ui/_queries/records/getRecordsFromLibraryQuery';
import {SortOrder} from '_ui/_gqlTypes';
import {MockedResponse} from '@apollo/client/testing';
import {useGetOptionsQuery} from './useGetOptionsQuery';
import {renderHook, waitFor} from '_ui/_tests/testUtils';
import {mockFormElementLink} from '_ui/__mocks__/common/form';

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

    const mockFactory: (data: IGetRecordsFromLibraryQuery) => MockedResponse[] = data => [
        {
            request: {
                query: getRecordsFromLibraryQuery(),
                variables: {library: 'test_lib', limit: 1000, sort: {field: 'label', order: SortOrder.asc}}
            },
            result: {data}
        }
    ];

    beforeEach(() => {
        onSelectChangeMock.mockClear();
    });

    describe('Query library from server', () => {
        test('Should set loading to false once data is loaded', async () => {
            const mock = mockFactory({records: {list: [], totalCount: 0}});

            const {result} = renderHook((...props) => useGetOptionsQuery(...props), {
                initialProps: {
                    attribute: mockFormElementLink.attribute,
                    onSelectChange: onSelectChangeMock
                },
                mocks: mock
            });

            expect(result.current.loading).toBe(true);

            await waitFor(() => expect(result.current.loading).toBe(false));
        });

        test('Should expose selectOptions ready to display', async () => {
            const mock = mockFactory({records});

            const {result} = renderHook(
                () =>
                    useGetOptionsQuery({
                        attribute: mockFormElementLink.attribute,
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
                            description: 'Danette pistache'
                        },
                        label: 'Danette pistache',
                        value: '28121951'
                    },
                    {
                        idCard: {
                            avatarProps: expect.anything(),
                            description: 'Danette chocolat'
                        },
                        label: 'Danette chocolat',
                        value: '15061943'
                    }
                ])
            );
        });

        test('Should expose selectOptions with ids as labels ready to display', async () => {
            const mock = mockFactory({records: recordsWithoutLabel});

            const {result} = renderHook(
                () =>
                    useGetOptionsQuery({
                        attribute: mockFormElementLink.attribute,
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
                            description: '28121951'
                        },
                        label: '28121951',
                        value: '28121951'
                    },
                    {
                        idCard: {
                            avatarProps: expect.anything(),
                            description: '15061943'
                        },
                        label: '15061943',
                        value: '15061943'
                    }
                ])
            );
        });

        describe('updateLeavField', () => {
            test('Should call onSelectChange with selectedLinkValue if record in list', async () => {
                const mock = mockFactory({records});
                const {result} = renderHook(
                    () =>
                        useGetOptionsQuery({
                            attribute: mockFormElementLink.attribute,
                            onSelectChange: onSelectChangeMock
                        }),
                    {mocks: mock}
                );

                await waitFor(() => result.current.selectOptions.length === 3);

                const selectedRecord = records.list[0];
                result.current.updateLeavField([selectedRecord.id], []);

                expect(onSelectChangeMock).toHaveBeenCalledWith([{value: records.list[0], idValue: null}]);
            });
        });
    });

    describe('Option Values from attribute list', () => {
        const linkValuesList = {
            enable: true,
            allowFreeEntry: false,
            allowListUpdate: false,
            values: records.list
        };

        const linkValuesWithoutLabelList = {
            enable: true,
            allowFreeEntry: false,
            allowListUpdate: false,
            values: recordsWithoutLabel.list
        };

        test('Should set loading to false', async () => {
            const {result} = renderHook((...props) => useGetOptionsQuery(...props), {
                initialProps: {
                    attribute: {...mockFormElementLink.attribute, linkValuesList},
                    onSelectChange: onSelectChangeMock
                }
            });

            expect(result.current.loading).toBe(false);
        });

        test('Should expose selectOptions ready to display', async () => {
            const {result} = renderHook(() =>
                useGetOptionsQuery({
                    attribute: {...mockFormElementLink.attribute, linkValuesList},
                    onSelectChange: onSelectChangeMock
                })
            );

            expect(result.current.selectOptions).toEqual([
                {
                    idCard: {
                        avatarProps: expect.anything(),
                        description: 'Danette pistache'
                    },
                    label: 'Danette pistache',
                    value: '28121951'
                },
                {
                    idCard: {
                        avatarProps: expect.anything(),
                        description: 'Danette chocolat'
                    },
                    label: 'Danette chocolat',
                    value: '15061943'
                }
            ]);
        });

        test('Should expose selectOptions with ids as labels ready to display', async () => {
            const {result} = renderHook(() =>
                useGetOptionsQuery({
                    attribute: {...mockFormElementLink.attribute, linkValuesList: linkValuesWithoutLabelList},
                    onSelectChange: onSelectChangeMock
                })
            );

            expect(result.current.selectOptions).toEqual([
                {
                    idCard: {
                        avatarProps: expect.anything(),
                        description: '28121951'
                    },
                    label: '28121951',
                    value: '28121951'
                },
                {
                    idCard: {
                        avatarProps: expect.anything(),
                        description: '15061943'
                    },
                    label: '15061943',
                    value: '15061943'
                }
            ]);
        });

        describe('updateLeavField', () => {
            test('Should call onSelectChange with selectedLinkValue if record in list', async () => {
                const {result} = renderHook(() =>
                    useGetOptionsQuery({
                        attribute: {...mockFormElementLink.attribute, linkValuesList},
                        onSelectChange: onSelectChangeMock
                    })
                );

                const selectedRecord = records.list[0];
                result.current.updateLeavField([selectedRecord.id], []);

                expect(onSelectChangeMock).toHaveBeenCalledWith([{value: records.list[0], idValue: null}]);
            });
        });
    });
});
