import {adminUserSdk, e2eAdminUser, e2eGuestUser, e2eNonAdminGroupId, makeGraphQlCall} from '../../e2eUtils';

describe('PermissionsAdminPermissions', () => {
    const libraryId = 'permissions_admin_permissions_library_name';

    beforeAll(async () => {
        await adminUserSdk.SaveLibrary({library: {id: libraryId, label: {en: 'library test'}}});
    });

    describe('access permissions', () => {
        it('non admin user should not be authorized to access permissions', async () => {
            const gqlMutation = `{
                permissions(
                    type: library,
                    actions: [access_record]
                ) {
                    name
                    allowed
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('admin user should be authorized to access permissions', async () => {
            const gqlMutation = `{
                permissions(
                    type: library,
                    actions: [access_record]
                ) {
                    name
                    allowed
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });

        it('non admin user should not be authorized to access inherited permissions', async () => {
            const gqlMutation = `{
                inheritedPermissions(
                    type: library,
                    actions: [access_record]
                ) {
                    name
                    allowed
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('admin user should be authorized to access inherited permissions', async () => {
            const gqlMutation = `{
                inheritedPermissions(
                    type: library,
                    actions: [access_record]
                ) {
                    name
                    allowed
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });

        it('non admin user should not be authorized to access permissions actions by type', async () => {
            const gqlMutation = `{
                permissionsActionsByType(
                    type: library
                ) {
                    name
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('admin user should be authorized to access permissions actions by type', async () => {
            const gqlMutation = `{
                permissionsActionsByType(
                    type: library
                ) {
                    name
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
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
