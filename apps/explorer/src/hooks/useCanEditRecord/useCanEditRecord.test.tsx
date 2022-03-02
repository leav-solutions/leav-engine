// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedResponse} from '@apollo/client/testing';
import {getLibraryPermissionsQuery} from 'graphQL/queries/libraries/getLibraryPermissionsQuery';
import {getRecordPermissionsQuery} from 'graphQL/queries/records/getRecordPermissions';
import React from 'react';
import {act, render, screen, waitFor} from '_tests/testUtils';
import {useCanEditRecord} from './useCanEditRecord';

describe('ActiveTreeHook', () => {
    const mockLib = {id: 'my_lib', gqlNames: {type: 'myLib', query: 'MyLib'}};
    const mockRecordId = '123456';

    test('If record is editable, returns true', async () => {
        const mocks: MockedResponse[] = [
            {
                request: {
                    query: getRecordPermissionsQuery(mockLib.gqlNames.query),
                    variables: {recordId: mockRecordId}
                },
                result: {
                    data: {
                        [mockLib.gqlNames.query]: {
                            list: [
                                {
                                    permissions: {
                                        access_library: true,
                                        access_record: true,
                                        create_record: true,
                                        edit_record: true,
                                        delete_record: true
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const ComponentUsingHook = () => {
            const {loading, canEdit} = useCanEditRecord(mockLib, mockRecordId);

            return loading ? <>LOADING</> : <div data-testid="elem">{canEdit ? 'CAN_EDIT' : 'CANNOT_EDIT'}</div>;
        };

        await act(async () => {
            render(<ComponentUsingHook />, {apolloMocks: mocks});
        });

        await waitFor(() => screen.getByTestId('elem'));

        expect(screen.getByTestId('elem')).toHaveTextContent('CAN_EDIT');
    });

    test('If record is not editable, return false', async () => {
        const mocks: MockedResponse[] = [
            {
                request: {
                    query: getRecordPermissionsQuery(mockLib.gqlNames.query),
                    variables: {recordId: mockRecordId}
                },
                result: {
                    data: {
                        [mockLib.gqlNames.query]: {
                            list: [
                                {
                                    permissions: {
                                        access_record: false,
                                        create_record: true,
                                        edit_record: false,
                                        delete_record: true
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const ComponentUsingHook = () => {
            const {loading, canEdit, isReadOnly} = useCanEditRecord(mockLib, mockRecordId);

            return loading ? (
                <>LOADING</>
            ) : (
                <>
                    <div data-testid="can-edit">{canEdit ? 'CAN_EDIT' : 'CANNOT_EDIT'}</div>
                    <div data-testid="is-read-only">{isReadOnly ? 'READ_ONLY' : 'NOT_READ_ONLY'}</div>
                </>
            );
        };

        await act(async () => {
            render(<ComponentUsingHook />, {apolloMocks: mocks});
        });

        await waitFor(() => screen.getByTestId('can-edit'));

        expect(screen.getByTestId('can-edit')).toHaveTextContent('CANNOT_EDIT');
        expect(screen.getByTestId('is-read-only')).toHaveTextContent('READ_ONLY');
    });

    test('If record is not specified, use creation permission on library', async () => {
        const mocks: MockedResponse[] = [
            {
                request: {
                    query: getLibraryPermissionsQuery,
                    variables: {libraryId: mockLib.id}
                },
                result: {
                    data: {
                        libraries: {
                            list: [
                                {
                                    permissions: {
                                        access_library: true,
                                        access_record: true,
                                        create_record: true,
                                        edit_record: true,
                                        delete_record: true
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const ComponentUsingHook = () => {
            const {loading, canEdit} = useCanEditRecord(mockLib);

            return loading ? <>LOADING</> : <div data-testid="elem">{canEdit ? 'CAN_EDIT' : 'CANNOT_EDIT'}</div>;
        };

        await act(async () => {
            render(<ComponentUsingHook />, {apolloMocks: mocks});
        });

        await waitFor(() => screen.getByTestId('elem'));

        expect(screen.getByTestId('elem')).toHaveTextContent('CAN_EDIT');
    });

    test('If record is not specified, use creation permission on library. Returns false', async () => {
        const mocks: MockedResponse[] = [
            {
                request: {
                    query: getLibraryPermissionsQuery,
                    variables: {libraryId: mockLib.id}
                },
                result: {
                    data: {
                        libraries: {
                            list: [
                                {
                                    permissions: {
                                        access_library: true,
                                        access_record: true,
                                        create_record: false,
                                        edit_record: true,
                                        delete_record: true
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const ComponentUsingHook = () => {
            const {loading, canEdit} = useCanEditRecord(mockLib);

            return loading ? <>LOADING</> : <div data-testid="elem">{canEdit ? 'CAN_EDIT' : 'CANNOT_EDIT'}</div>;
        };

        await act(async () => {
            render(<ComponentUsingHook />, {apolloMocks: mocks});
        });

        await waitFor(() => screen.getByTestId('elem'));

        expect(screen.getByTestId('elem')).toHaveTextContent('CANNOT_EDIT');
    });
});
