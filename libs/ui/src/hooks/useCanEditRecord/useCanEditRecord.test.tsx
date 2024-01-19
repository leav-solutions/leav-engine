// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {QueryResult} from '@apollo/client';
import {Mockify} from '@leav/utils';
import * as gqlTypes from '_ui/_gqlTypes';
import {render, screen} from '../../_tests/testUtils';
import {useCanEditRecord} from './useCanEditRecord';

describe('useCanEditRecord', () => {
    const mockLib = {id: 'my_lib'};
    const mockRecordId = '123456';

    test('If record is editable, returns true', async () => {
        const mockResultIsAllowed: Mockify<typeof gqlTypes.useIsAllowedQuery> = {
            loading: false,
            data: {
                isAllowed: [
                    {
                        name: gqlTypes.PermissionsActions.create_record,
                        allowed: true
                    },
                    {
                        name: gqlTypes.PermissionsActions.access_record,
                        allowed: true
                    },
                    {
                        name: gqlTypes.PermissionsActions.edit_record,
                        allowed: true
                    },
                    {
                        name: gqlTypes.PermissionsActions.delete_record,
                        allowed: true
                    }
                ]
            },
            called: true
        };
        const spy = jest
            .spyOn(gqlTypes, 'useIsAllowedQuery')
            .mockImplementation(
                () => mockResultIsAllowed as QueryResult<gqlTypes.IsAllowedQuery, gqlTypes.IsAllowedQueryVariables>
            );

        const ComponentUsingHook = () => {
            const {loading, canEdit} = useCanEditRecord(mockLib, mockRecordId);

            return loading ? <>LOADING</> : <div data-testid="elem">{canEdit ? 'CAN_EDIT' : 'CANNOT_EDIT'}</div>;
        };

        render(<ComponentUsingHook />);

        expect(screen.getByTestId('elem')).toHaveTextContent('CAN_EDIT');

        spy.mockRestore();
    });

    test('If record is not editable, return false', async () => {
        const mockResultIsAllowed: Mockify<typeof gqlTypes.useIsAllowedQuery> = {
            loading: false,
            data: {
                isAllowed: [
                    {
                        name: gqlTypes.PermissionsActions.create_record,
                        allowed: true
                    },
                    {
                        name: gqlTypes.PermissionsActions.access_record,
                        allowed: false
                    },
                    {
                        name: gqlTypes.PermissionsActions.edit_record,
                        allowed: false
                    },
                    {
                        name: gqlTypes.PermissionsActions.delete_record,
                        allowed: true
                    }
                ]
            },
            called: true
        };
        const spy = jest
            .spyOn(gqlTypes, 'useIsAllowedQuery')
            .mockImplementation(
                () => mockResultIsAllowed as QueryResult<gqlTypes.IsAllowedQuery, gqlTypes.IsAllowedQueryVariables>
            );

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

        render(<ComponentUsingHook />);

        expect(screen.getByTestId('can-edit')).toHaveTextContent('CANNOT_EDIT');
        expect(screen.getByTestId('is-read-only')).toHaveTextContent('READ_ONLY');

        spy.mockRestore();
    });

    test('If record is not specified, use creation permission on library', async () => {
        const mockResultLibraryPermissions: Mockify<typeof gqlTypes.useGetLibraryPermissionsQuery> = {
            loading: false,
            data: {
                libraries: {
                    list: [
                        {
                            permissions: {
                                [gqlTypes.PermissionsActions.access_library]: true,
                                [gqlTypes.PermissionsActions.create_record]: true,
                                [gqlTypes.PermissionsActions.access_record]: true,
                                [gqlTypes.PermissionsActions.edit_record]: true,
                                [gqlTypes.PermissionsActions.delete_record]: true
                            }
                        }
                    ]
                }
            },
            called: true
        };
        const spy = jest
            .spyOn(gqlTypes, 'useGetLibraryPermissionsQuery')
            .mockImplementation(
                () =>
                    mockResultLibraryPermissions as QueryResult<
                        gqlTypes.GetLibraryPermissionsQuery,
                        gqlTypes.GetLibraryPermissionsQueryVariables
                    >
            );

        const ComponentUsingHook = () => {
            const {loading, canEdit} = useCanEditRecord(mockLib);

            return loading ? <>LOADING</> : <div data-testid="elem">{canEdit ? 'CAN_EDIT' : 'CANNOT_EDIT'}</div>;
        };

        render(<ComponentUsingHook />);

        expect(screen.getByTestId('elem')).toHaveTextContent('CAN_EDIT');

        spy.mockRestore();
    });

    test('If record is not specified, use creation permission on library. Returns false', async () => {
        const mockResultLibraryPermissions: Mockify<typeof gqlTypes.useGetLibraryPermissionsQuery> = {
            loading: false,
            data: {
                libraries: {
                    list: [
                        {
                            permissions: {
                                [gqlTypes.PermissionsActions.access_library]: true,
                                [gqlTypes.PermissionsActions.create_record]: false,
                                [gqlTypes.PermissionsActions.access_record]: true,
                                [gqlTypes.PermissionsActions.edit_record]: true,
                                [gqlTypes.PermissionsActions.delete_record]: true
                            }
                        }
                    ]
                }
            },
            called: true
        };
        const spy = jest
            .spyOn(gqlTypes, 'useGetLibraryPermissionsQuery')
            .mockImplementation(
                () =>
                    mockResultLibraryPermissions as QueryResult<
                        gqlTypes.GetLibraryPermissionsQuery,
                        gqlTypes.GetLibraryPermissionsQueryVariables
                    >
            );

        const ComponentUsingHook = () => {
            const {loading, canEdit} = useCanEditRecord(mockLib);

            return loading ? <>LOADING</> : <div data-testid="elem">{canEdit ? 'CAN_EDIT' : 'CANNOT_EDIT'}</div>;
        };

        render(<ComponentUsingHook />);

        expect(screen.getByTestId('elem')).toHaveTextContent('CANNOT_EDIT');

        spy.mockRestore();
    });
});
