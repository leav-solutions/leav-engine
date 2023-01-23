// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider, MockedResponse} from '@apollo/client/testing';
import {isAllowedQuery} from 'queries/permissions/isAllowedQuery';
import {PermissionsActions, PermissionTypes} from '_gqlTypes/globalTypes';
import {renderHook, waitFor} from '_tests/testUtils';
import {useApplicationsPermissions} from './useApplicationsPermissions';

describe('useCanEditRecord', () => {
    test('Returns applications admin permissions', async () => {
        const mocks: MockedResponse[] = [
            {
                request: {
                    query: isAllowedQuery,
                    variables: {
                        type: PermissionTypes.admin,
                        actions: [
                            PermissionsActions.admin_create_application,
                            PermissionsActions.admin_delete_application
                        ]
                    }
                },
                result: {
                    data: {
                        isAllowed: [
                            {name: 'admin_create_application', allowed: true},
                            {name: 'admin_delete_application', allowed: true}
                        ]
                    }
                }
            }
        ];

        const {result} = renderHook(() => useApplicationsPermissions(), {
            wrapper: ({children}) => <MockedProvider mocks={mocks}>{children}</MockedProvider>
        });

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.canCreate).toBe(true);
        expect(result.current.canDelete).toBe(true);
    });

    test('If query failed, expose error', async () => {
        const mocks: MockedResponse[] = [
            {
                request: {
                    query: isAllowedQuery,
                    variables: {
                        type: PermissionTypes.admin,
                        actions: [
                            PermissionsActions.admin_create_application,
                            PermissionsActions.admin_delete_application
                        ]
                    }
                },
                result: {
                    // @ts-ignore
                    errors: [new Error('Test error')]
                }
            }
        ];

        const {result} = renderHook(() => useApplicationsPermissions(), {
            wrapper: ({children}) => <MockedProvider mocks={mocks}>{children}</MockedProvider>
        });

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeTruthy();
    });
});
