// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {getPermissionsActionsQuery} from '../../../queries/permissions/getPermissionsActionsQuery';
import {getPermissionsQuery} from '../../../queries/permissions/getPermissionsQuery';
import {GET_PERMISSIONSVariables} from '../../../_gqlTypes/GET_PERMISSIONS';
import {PermissionsActions, PermissionTypes} from '../../../_gqlTypes/globalTypes';
import EditPermissions from './EditPermissions';

jest.mock('../EditPermissionsView', () => {
    return function EditPermissionsView() {
        return <div>EditPermissionsView</div>;
    };
});

describe('EditPermissions', () => {
    const permParams: GET_PERMISSIONSVariables = {
        type: PermissionTypes.app,
        actions: [PermissionsActions.app_create_library, PermissionsActions.app_edit_library],
        usersGroup: '1234567'
    };
    test('Loading and success state', async () => {
        const mocks = [
            {
                request: {
                    query: getPermissionsActionsQuery,
                    variables: {type: permParams.type}
                },
                result: {
                    data: {
                        permissionsActionsByType: [
                            {
                                __typename: 'LabeledPermissionsActions',
                                name: PermissionsActions.app_create_library,
                                label: {
                                    fr: 'Crea Lib'
                                }
                            },
                            {
                                __typename: 'LabeledPermissionsActions',
                                name: PermissionsActions.app_edit_library,
                                label: {
                                    fr: 'Edit Lib'
                                }
                            }
                        ]
                    }
                }
            },
            {
                request: {
                    query: getPermissionsQuery,
                    variables: permParams
                },
                result: {
                    data: {
                        perm: [
                            {
                                __typename: 'PermissionAction',
                                name: PermissionsActions.app_create_library,
                                allowed: true
                            },
                            {
                                __typename: 'PermissionAction',
                                name: PermissionsActions.app_edit_library,
                                allowed: null
                            }
                        ],
                        inheritPerm: [
                            {
                                __typename: 'HeritedPermissionAction',
                                name: PermissionsActions.app_create_library,
                                allowed: true
                            },
                            {
                                __typename: 'HeritedPermissionAction',
                                name: PermissionsActions.app_edit_library,
                                allowed: true
                            }
                        ]
                    }
                }
            }
        ];

        render(<EditPermissions permParams={permParams} />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/)).toBeInTheDocument();
        expect(await screen.findByText('EditPermissionsView')).toBeInTheDocument();
    });

    test('Error state', async () => {
        const mocks = [
            {
                request: {
                    query: getPermissionsActionsQuery,
                    variables: {type: permParams.type}
                },
                error: new Error('Boom!')
            }
        ];

        await act(async () => {
            render(<EditPermissions permParams={permParams} />, {apolloMocks: mocks});
        });

        expect(screen.getByText(/Boom!/)).toBeInTheDocument();
    });
});
