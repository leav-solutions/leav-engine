import {MockedProvider, wait} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
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
                        heritPerm: [
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

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename>
                    <EditPermissions permParams={permParams} />
                </MockedProvider>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('EditPermissionsView')).toHaveLength(1);
    });

    test('Error state', async () => {
        const mocks = [
            {
                request: {
                    query: getPermissionsQuery,
                    variables: permParams
                },
                error: new Error('Boom!')
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename>
                    <EditPermissions permParams={permParams} />
                </MockedProvider>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('[data-test-id="error"]')).toHaveLength(1);
    });
});
