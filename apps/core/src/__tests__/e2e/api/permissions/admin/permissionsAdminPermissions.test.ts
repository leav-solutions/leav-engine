// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {e2eAdminUser, e2eGuestUser, gqlSaveLibrary, makeGraphQlCall} from '../../e2eUtils';

describe('PermissionsAdminPermissions', () => {
    const libraryId = 'permissions_admin_permissions_library_name';

    beforeAll(async () => {
        await gqlSaveLibrary(libraryId, 'library test');
    });

    describe('edit permissions', () => {
        it('non admin user should not be authorized to edit permissions', async () => {
            const gqlMutation = `mutation {
                savePermission(
                    permission: {
                        type: library,
                        applyTo: "${libraryId}",
                        usersGroup: null,
                        actions: [
                            {name: access_record, allowed: false},
                        ]
                    }
                ) { type }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('admin user should be authorized to edit permissions', async () => {
            const gqlMutation = `mutation {
                savePermission(
                    permission: {
                        type: library,
                        applyTo: "${libraryId}",
                        usersGroup: null,
                        actions: [
                            {name: access_record, allowed: false},
                        ]
                    }
                ) { type }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });
});
