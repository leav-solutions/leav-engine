import {renderHook} from '@testing-library/react';
import React, {type ReactNode} from 'react';
import * as GraphQLClient from '../../../../../__generated__';
import {useGetRecordInformation} from '../useGetRecordInformation';
import {LangContext, type ILangContext, MockedLangContextProvider} from '@leav/ui';

describe('useGetRecordInformation', () => {
    let useGetRecordInformationQuerySpy: jest.SpyInstance;

    const createEnglishWrapper =
        () =>
        ({children}: {children: ReactNode}) => {
            const mockLangContextEn: ILangContext = {
                lang: ['en'],
                availableLangs: ['en', 'fr'],
                defaultLang: 'en',
                setLang: jest.fn(),
            };
            return <LangContext.Provider value={mockLangContextEn}>{children}</LangContext.Provider>;
        };

    beforeEach(() => {
        useGetRecordInformationQuerySpy = jest.spyOn(GraphQLClient, 'useGetRecordInformationQuery');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Loading and error states', () => {
        it('should return loading true and recordInformation null when loading', () => {
            useGetRecordInformationQuerySpy.mockReturnValue({
                data: undefined,
                loading: true,
                error: undefined,
            });

            const {result} = renderHook(() => useGetRecordInformation({recordId: '123', libraryId: 'test_library'}), {
                wrapper: MockedLangContextProvider,
            });

            expect(result.current.loading).toBe(true);
            expect(result.current.recordInformation).toBe(null);
            expect(result.current.error).toBe(undefined);
        });

        it('should return error and recordInformation null when query fails', () => {
            const mockError = new Error('GraphQL Error');
            useGetRecordInformationQuerySpy.mockReturnValue({
                data: undefined,
                loading: false,
                error: mockError,
            });

            const {result} = renderHook(() => useGetRecordInformation({recordId: '123', libraryId: 'test_library'}), {
                wrapper: MockedLangContextProvider,
            });

            expect(result.current.loading).toBe(false);
            expect(result.current.recordInformation).toBe(null);
            expect(result.current.error).toBe(mockError);
        });

        it('should return recordInformation null when data is undefined', () => {
            useGetRecordInformationQuerySpy.mockReturnValue({
                data: undefined,
                loading: false,
                error: undefined,
            });

            const {result} = renderHook(() => useGetRecordInformation({recordId: '123', libraryId: 'test_library'}), {
                wrapper: MockedLangContextProvider,
            });

            expect(result.current.loading).toBe(false);
            expect(result.current.recordInformation).toBe(null);
        });
    });

    describe('Data transformation', () => {
        it('should transform complete data structure correctly', () => {
            useGetRecordInformationQuerySpy.mockReturnValue({
                data: {
                    records: {
                        list: [
                            {
                                library: {
                                    label: {
                                        fr: 'Bibliothèque Test',
                                        en: 'Test Library',
                                    },
                                },
                                created_by: [
                                    {
                                        payload: {
                                            id: 'user1',
                                            email: [
                                                {
                                                    values: [
                                                        {
                                                            payload: 'creator@test.com',
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                ],
                                modified_by: [
                                    {
                                        payload: {
                                            id: 'user2',
                                            email: [
                                                {
                                                    values: [
                                                        {
                                                            payload: 'modifier@test.com',
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                ],
                                created_at: [
                                    {
                                        payload: '2024-01-01T00:00:00Z',
                                    },
                                ],
                                modified_at: [
                                    {
                                        payload: '2024-01-02T00:00:00Z',
                                    },
                                ],
                            },
                        ],
                    },
                },
                loading: false,
                error: undefined,
            });

            const {result} = renderHook(() => useGetRecordInformation({recordId: '123', libraryId: 'test_library'}), {
                wrapper: MockedLangContextProvider,
            });

            expect(result.current.recordInformation).toEqual({
                libraryName: 'Bibliothèque Test',
                createdBy: {
                    id: 'user1',
                    email: 'creator@test.com',
                },
                modifiedBy: {
                    id: 'user2',
                    email: 'modifier@test.com',
                },
                createdAt: '2024-01-01T00:00:00Z',
                modifiedAt: '2024-01-02T00:00:00Z',
            });
        });

        it('should use correct language for library name translation', () => {
            useGetRecordInformationQuerySpy.mockReturnValue({
                data: {
                    records: {
                        list: [
                            {
                                library: {
                                    label: {
                                        fr: 'Bibliothèque Test',
                                        en: 'Test Library',
                                    },
                                },
                                created_by: [],
                                modified_by: [],
                                created_at: [],
                                modified_at: [],
                            },
                        ],
                    },
                },
                loading: false,
                error: undefined,
            });

            const {result} = renderHook(() => useGetRecordInformation({recordId: '123', libraryId: 'test_library'}), {
                wrapper: createEnglishWrapper(),
            });

            expect(result.current.recordInformation?.libraryName).toBe('Test Library');
        });
    });
});
