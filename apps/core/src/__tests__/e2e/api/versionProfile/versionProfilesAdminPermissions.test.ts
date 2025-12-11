// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {e2eAdminUser, e2eGuestUser, gqlSaveTree, makeGraphQlCall} from '../e2eUtils';

describe('VersionProfilesAdminPermissions', () => {
    const testTreeName = 'version_profile_admin_permissions_tree';
    const versionProfileId = 'version_profile_admin_permissions_profile';

    beforeAll(async () => {
        // Create a tree for version profile tests
        await gqlSaveTree(testTreeName, 'Test Tree for Permissions', ['users']);

        // Create initial version profile for edit/delete tests (as admin)
        const res = await makeGraphQlCall(`mutation {
            saveVersionProfile(versionProfile: {
                id: "${versionProfileId}",
                label: {en: "Version Profile for Permissions"},
                trees: ["${testTreeName}"]
            }) {
                id
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveVersionProfile.id).toBe(versionProfileId);
    });

    describe('create version profile', () => {
        it('Should not be authorized to create a version profile', async () => {
            const gqlMutation = `mutation {
                saveVersionProfile(versionProfile: {
                    id: "version_profile_admin_permissions_new_profile",
                    label: {en: "New Version Profile"},
                    trees: ["${testTreeName}"]
                }) {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('Should be authorized to create a version profile', async () => {
            const gqlMutation = `mutation {
                saveVersionProfile(versionProfile: {
                    id: "version_profile_admin_permissions_new_profile_from_admin",
                    label: {en: "New Version Profile from Admin"},
                    trees: ["${testTreeName}"]
                }) {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });

    describe('edit version profile', () => {
        it('Should not be authorized to edit a version profile', async () => {
            const gqlMutation = `mutation {
                saveVersionProfile(versionProfile: {
                    id: "${versionProfileId}",
                    label: {en: "Modified Version Profile"}
                }) {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('Should be authorized to edit a version profile', async () => {
            const gqlMutation = `mutation {
                saveVersionProfile(versionProfile: {
                    id: "${versionProfileId}",
                    label: {en: "Modified Version Profile from Admin"}
                }) {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });

    describe('delete version profile', () => {
        it('Should not be authorized to delete a version profile', async () => {
            const gqlMutation = `mutation {
                deleteVersionProfile(id: "${versionProfileId}") {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('Should be authorized to delete a version profile', async () => {
            const gqlMutation = `mutation {
                deleteVersionProfile(id: "${versionProfileId}") {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });
});
