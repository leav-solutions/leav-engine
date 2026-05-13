import {e2eNonAdminGroupId, e2eNonAdminUser, gqlSaveApplication, makeGraphQlCall} from '../e2eUtils';

describe('ApplicationsPermissions', () => {
    const testAppId = 'test_permissions_app';

    beforeAll(async () => {
        // Create library to use in permissions tree
        await gqlSaveApplication(testAppId, 'Test app permissions', 'permission-app');
    });

    test('Save and get application permissions', async () => {
        // Save non-admin permissions
        const resSaveLibPerm = await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: application,
                        applyTo: "${testAppId}",
                        usersGroup: "${e2eNonAdminGroupId()}",
                        actions: [
                            {name: access_application, allowed: true},
                            {name: admin_application, allowed: false}
                        ]
                    }
                ) {
                    type
                    usersGroup
                    actions {
                        name
                        allowed
                    }
                }
            }`);

        expect(resSaveLibPerm.status).toBe(200);
        expect(resSaveLibPerm.data.errors).toBeUndefined();

        expect(resSaveLibPerm.data.data.savePermission.type).toBeDefined();

        // Get app permissions
        const resGetLibPerm = await makeGraphQlCall(`{
                permissions(
                    type: application,
                    applyTo: "${testAppId}",
                    usersGroup: "${e2eNonAdminGroupId()}",
                    actions: [admin_application]
                ) {
                    name
                    allowed
                }
            }`);

        expect(resGetLibPerm.status).toBe(200);
        expect(resGetLibPerm.data.errors).toBeUndefined();

        expect(resGetLibPerm.data.data.permissions).toEqual([{name: 'admin_application', allowed: false}]);

        const resIsAllowed = await makeGraphQlCall(
            `query {
                isAllowed(
                    type: application,
                    actions: [admin_application],
                    applyTo: "${testAppId}"
                ) {
                    name
                    allowed
                }
            }`,
            {
                user: e2eNonAdminUser(),
            },
        );

        expect(resIsAllowed.status).toBe(200);
        expect(resIsAllowed.data.errors).toBeUndefined();

        expect(resIsAllowed.data.data.isAllowed).toBeDefined();
        expect(resIsAllowed.data.data.isAllowed[0].name).toBe('admin_application');
        expect(resIsAllowed.data.data.isAllowed[0].allowed).toBe(false);
    });
});
